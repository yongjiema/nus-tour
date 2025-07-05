import { Injectable, NotFoundException, Inject, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, LessThan, In } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { ReserveSlotDto } from "./dto/reserve-slot.dto";
import { BookingStatus } from "../database/entities/enums";
import { Payment } from "../database/entities/payments.entity";
import { User } from "../database/entities/user.entity";
import { TimeSlot } from "../database/entities/timeSlot.entity";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  // Configuration for slot reservation timeout (15 minutes)
  private readonly SLOT_RESERVATION_TIMEOUT_MINUTES = 15;

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
    @Inject(DataSource)
    private dataSource: DataSource,
  ) {}

  async createBooking(
    createBookingDto: CreateBookingDto,
    userContext?: { id: string; email: string; firstName?: string; lastName?: string },
  ): Promise<Booking> {
    try {
      this.logger.log("Creating new booking", { dto: createBookingDto });

      // -----------------------------
      // 1. Validate date (YYYY-MM-DD) and ensure it's from tomorrow onwards
      // -----------------------------
      const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
      const match = dateRegex.exec(createBookingDto.date);
      if (!match) {
        throw new BadRequestException(
          "Invalid date components. Ensure YYYY-MM-DD and that year, month, and day are numeric.",
        );
      }

      const [_, yearStr, monthStr, dayStr] = match;
      const year = Number(yearStr);
      const month = Number(monthStr) - 1; // JS months are 0-indexed
      const day = Number(dayStr);
      const bookingDate = new Date(year, month, day);

      // Check for invalid date (e.g. 2025-02-31)
      if (Number.isNaN(bookingDate.getTime())) {
        throw new BadRequestException(
          "Invalid date components. Ensure YYYY-MM-DD and that year, month, and day are numeric.",
        );
      }

      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (bookingDate < tomorrow) {
        throw new BadRequestException("Booking date must be from tomorrow onwards");
      }

      // -----------------------------
      // 2. Validate time slot via DB lookup & capacity check
      // -----------------------------
      const { startsAt, endsAt } = this.parseTimeSlotLabel(createBookingDto.timeSlot);
      const timeSlotEntity = await this.timeSlotRepository.findOne({ where: { startsAt, endsAt } });

      if (!timeSlotEntity) {
        throw new BadRequestException("Invalid time slot");
      }

      // -----------------------------
      // 3. Check capacity for the selected slot (uses capacity from DB)
      // -----------------------------
      const existingCount = await this.bookingRepository.count({
        where: { date: bookingDate, timeSlot: timeSlotEntity.label },
      });

      if (existingCount >= timeSlotEntity.capacity) {
        throw new BadRequestException("Selected time slot is fully booked");
      }

      // -----------------------------
      // 4. Persist booking
      // -----------------------------
      const booking = this.bookingRepository.create({
        date: bookingDate,
        groupSize: createBookingDto.groupSize,
        timeSlot: timeSlotEntity.label,
        deposit: createBookingDto.deposit ?? 50,
        status: BookingStatus.AWAITING_PAYMENT,
        user: { id: userContext?.id } as User,
      });

      const savedBooking = await this.bookingRepository.save(booking);
      this.logger.log("Booking created successfully", { bookingId: savedBooking.id });

      return savedBooking;
    } catch (error) {
      this.logger.error("Failed to create booking", error);
      throw error;
    }
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({
      relations: ["checkin", "payment"],
    });
  }

  async findOne(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ["checkin", "payment"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.findOne(bookingId);
    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async getBookingStatistics(): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    completedBookings: number;
  }> {
    const [totalBookings, confirmedBookings, pendingBookings, completedBookings] = await Promise.all([
      this.bookingRepository.count(),
      this.bookingRepository.count({ where: { status: BookingStatus.CONFIRMED } }),
      this.bookingRepository.count({ where: { status: BookingStatus.AWAITING_PAYMENT } }),
      this.bookingRepository.count({ where: { status: BookingStatus.COMPLETED } }),
    ]);

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      completedBookings,
    };
  }

  async getBookingWithPayment(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ["payment", "user"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  async updateBookingPayment(
    bookingId: string,
    paymentData: {
      transactionId: string;
      amount: number;
      status: BookingStatus;
      paymentMethod: string;
    },
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId },
        relations: ["payment"],
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${bookingId} not found`);
      }

      booking.status = paymentData.status;

      // Create or update payment record
      let payment = booking.payment;
      if (!payment) {
        payment = manager.create(Payment, {
          bookingId: booking.id,
          transactionId: paymentData.transactionId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          booking,
        });
      } else {
        payment.transactionId = paymentData.transactionId;
        payment.amount = paymentData.amount;
        payment.paymentMethod = paymentData.paymentMethod;
      }

      await manager.save(Booking, booking);
      await manager.save(Payment, payment);
    });
  }

  /**
   * Returns available time slots for a given date.
   * Capacity and slot definitions are fetched dynamically from the `time_slot` table,
   * allowing them to be managed without code changes.
   */
  async getAvailableTimeSlots(
    date: string,
    userContext?: { id: string; email: string },
  ): Promise<{ slot: string; available: number; userHasBooking?: boolean; userBookingStatus?: string }[]> {
    // Clean up expired reservations first
    await this.cleanupExpiredReservations();

    const allSlots = await this.timeSlotRepository.find();
    const bookingDate = new Date(date);
    const results: { slot: string; available: number; userHasBooking?: boolean; userBookingStatus?: string }[] = [];

    for (const slotEntity of allSlots) {
      // Sum total group sizes for this slot (not count of bookings)
      const totalGroupSizeResult = (await this.bookingRepository
        .createQueryBuilder("booking")
        .select("SUM(booking.groupSize)", "totalGroupSize")
        .where("booking.date = :date", { date: bookingDate })
        .andWhere("booking.timeSlot = :timeSlot", { timeSlot: slotEntity.label })
        .andWhere("booking.status IN (:...statuses)", {
          statuses: [
            BookingStatus.SLOT_RESERVED,
            BookingStatus.AWAITING_PAYMENT,
            BookingStatus.PAID,
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
          ],
        })
        .getRawOne()) as { totalGroupSize: string } | null;

      const totalGroupSize = parseInt(totalGroupSizeResult?.totalGroupSize ?? "0") || 0;
      const available = Math.max(slotEntity.capacity - totalGroupSize, 0);

      // Check if current user already has a booking for this slot
      let userHasBooking = false;
      let userBookingStatus: string | undefined;

      if (userContext?.id) {
        const userBooking = await this.bookingRepository.findOne({
          where: {
            user: { id: userContext.id },
            date: bookingDate,
            timeSlot: slotEntity.label,
            status: In([
              BookingStatus.SLOT_RESERVED,
              BookingStatus.AWAITING_PAYMENT,
              BookingStatus.PAID,
              BookingStatus.CONFIRMED,
              BookingStatus.CHECKED_IN,
            ]),
          },
        });

        if (userBooking) {
          userHasBooking = true;
          userBookingStatus = userBooking.status;
        }
      }

      results.push({
        slot: slotEntity.label,
        available,
        userHasBooking,
        userBookingStatus,
      });
    }

    return results;
  }

  /** Retrieve all bookings for a given user e-mail */
  async findAllByEmail(email: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { user: { email } as unknown as User },
      order: { createdAt: "DESC" },
      relations: ["payment", "user"],
    });
  }

  /** Retrieve a booking by its UUID (`bookingId`). */
  async getBookingById(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ["payment", "user"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

  /** Count total bookings */
  async count(): Promise<number> {
    return this.bookingRepository.count();
  }

  /** Count bookings with COMPLETED status */
  async countCompleted(): Promise<number> {
    // Uses query builder for compatibility with older tests
    const qb = this.bookingRepository.createQueryBuilder("booking");
    return qb.where("booking.status = :status", { status: BookingStatus.COMPLETED }).getCount();
  }

  /** Get recently created bookings */
  async findRecent(limit: number): Promise<Booking[]> {
    return this.bookingRepository.find({ order: { createdAt: "DESC" }, take: limit });
  }

  /** Helper when only bookingId is available (already UUID) */
  async getBookingByUuid(uuid: string): Promise<Booking | null> {
    try {
      return await this.bookingRepository.findOne({
        where: { id: uuid },
        relations: ["payment"],
      });
    } catch {
      return null;
    }
  }

  /** Convenience method combining payment update and status change */
  async updatePaymentAndBookingStatus(
    bookingId: string,
    status: BookingStatus,
    paymentInfo: {
      transactionId: string;
      amount: number;
      method: string;
      userId: number;
    },
  ): Promise<Booking> {
    await this.updateBookingPayment(bookingId, {
      transactionId: paymentInfo.transactionId,
      amount: paymentInfo.amount,
      status,
      paymentMethod: paymentInfo.method,
    });
    return this.findOne(bookingId);
  }

  /**
   * Retrieve all bookings belonging to a specific user.
   * This is the preferred method moving forward.
   */
  async getAllBookingByUserId(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { user: { id: userId } as unknown as User },
      order: { createdAt: "DESC" },
      relations: ["payment", "user"],
    });
  }

  /**
   * Convert a string like "09:00 AM" to a DB time literal "09:00:00" (24-hour).
   */
  private toDbTime(timeLabel: string): string {
    if (!timeLabel) {
      throw new BadRequestException("Invalid time format");
    }
    const [timePart, period] = timeLabel.trim().split(" ");
    if (!timePart || !period) {
      throw new BadRequestException("Invalid time format");
    }
    const [hourStr, minuteStr] = timePart.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      throw new BadRequestException("Invalid time format");
    }
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
  }

  /**
   * Split a label like "09:00 AM - 10:00 AM" into DB start/end times.
   */
  private parseTimeSlotLabel(label: string): { startsAt: string; endsAt: string } {
    if (label === "" || !label.includes("-")) {
      throw new BadRequestException("Invalid time slot format");
    }
    const parts = label.split("-").map((v) => v.trim());
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new BadRequestException("Invalid time slot format");
    }
    const [startLabel, endLabel] = parts;
    return { startsAt: this.toDbTime(startLabel), endsAt: this.toDbTime(endLabel) };
  }

  /**
   * Reserve a slot temporarily (SLOT_RESERVED status)
   * This creates a booking with expiration time
   */
  async reserveSlot(
    reserveSlotDto: ReserveSlotDto,
    userContext?: { id: string; email: string; firstName?: string; lastName?: string },
  ): Promise<Booking> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        this.logger.log("Reserving slot", { dto: reserveSlotDto, userId: userContext?.id });

        // -----------------------------
        // 0. Validate user exists in database
        // -----------------------------
        if (!userContext?.id) {
          throw new BadRequestException("User context is required");
        }

        const user = await manager.findOne(User, {
          where: { id: userContext.id },
        });

        if (!user) {
          this.logger.error("User not found in database", {
            userId: userContext.id,
            email: userContext.email,
            message: "User ID from JWT token does not exist in database",
          });
          throw new BadRequestException(
            "User account not found in database. Your session may have expired or your account may have been removed. Please log out and log in again.",
          );
        }

        this.logger.log("User validated successfully", {
          userId: user.id,
          email: user.email,
        });

        // Clean up expired reservations first
        await this.cleanupExpiredReservations();

        // -----------------------------
        // 1. Validate date (YYYY-MM-DD) and ensure it's from tomorrow onwards
        // -----------------------------
        const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
        const match = dateRegex.exec(reserveSlotDto.date);
        if (!match) {
          throw new BadRequestException(
            "Invalid date components. Ensure YYYY-MM-DD and that year, month, and day are numeric.",
          );
        }

        const [_, yearStr, monthStr, dayStr] = match;
        const year = Number(yearStr);
        const month = Number(monthStr) - 1;
        const day = Number(dayStr);
        const bookingDate = new Date(year, month, day);

        if (Number.isNaN(bookingDate.getTime())) {
          throw new BadRequestException(
            "Invalid date components. Ensure YYYY-MM-DD and that year, month, and day are numeric.",
          );
        }

        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (bookingDate < tomorrow) {
          throw new BadRequestException("Booking date must be from tomorrow onwards");
        }

        // -----------------------------
        // 2. Validate time slot
        // -----------------------------
        const { startsAt, endsAt } = this.parseTimeSlotLabel(reserveSlotDto.timeSlot);
        const timeSlotEntity = await manager.findOne(TimeSlot, { where: { startsAt, endsAt } });

        if (!timeSlotEntity) {
          throw new BadRequestException("Invalid time slot");
        }

        // -----------------------------
        // 3. Check if the specific user already has a booking for this slot and handle appropriately
        // -----------------------------
        const existingUserBooking = await manager.findOne(Booking, {
          where: {
            user: { id: userContext.id },
            date: bookingDate,
            timeSlot: timeSlotEntity.label,
          },
        });

        if (existingUserBooking) {
          this.logger.log("User has existing booking for this slot", {
            userId: userContext.id,
            bookingId: existingUserBooking.id,
            status: existingUserBooking.status,
          });

          // Handle different booking statuses appropriately
          if (
            [
              BookingStatus.AWAITING_PAYMENT,
              BookingStatus.PAID,
              BookingStatus.CONFIRMED,
              BookingStatus.CHECKED_IN,
            ].includes(existingUserBooking.status)
          ) {
            // For confirmed/paid bookings, don't allow new booking
            throw new BadRequestException(
              `You already have a ${existingUserBooking.status.toLowerCase().replace("_", " ")} booking for this time slot`,
            );
          }

          // For ANY existing booking (including SLOT_RESERVED), cancel it and create a new one
          // This ensures proper audit trail and follows best practices
          if (
            [
              BookingStatus.SLOT_RESERVED,
              BookingStatus.SLOT_EXPIRED,
              BookingStatus.CANCELLED,
              BookingStatus.NO_SHOW,
              BookingStatus.PAYMENT_FAILED,
              BookingStatus.REFUNDED,
              BookingStatus.REFUND_FAILED,
            ].includes(existingUserBooking.status)
          ) {
            this.logger.log("Cancelling existing booking to create new reservation", {
              oldBookingId: existingUserBooking.id,
              oldStatus: existingUserBooking.status,
            });

            // Mark the old booking as cancelled (maintain audit trail)
            existingUserBooking.status = BookingStatus.CANCELLED;
            existingUserBooking.expiresAt = undefined; // Remove expiration
            await manager.save(existingUserBooking);

            this.logger.log("Old booking cancelled, proceeding to create new reservation", {
              cancelledBookingId: existingUserBooking.id,
            });
          }
        }

        // -----------------------------
        // 4. Check capacity including reservations and confirmed bookings
        // -----------------------------
        const existingCount = await manager.count(Booking, {
          where: [
            { date: bookingDate, timeSlot: timeSlotEntity.label, status: BookingStatus.SLOT_RESERVED },
            { date: bookingDate, timeSlot: timeSlotEntity.label, status: BookingStatus.AWAITING_PAYMENT },
            { date: bookingDate, timeSlot: timeSlotEntity.label, status: BookingStatus.PAID },
            { date: bookingDate, timeSlot: timeSlotEntity.label, status: BookingStatus.CONFIRMED },
            { date: bookingDate, timeSlot: timeSlotEntity.label, status: BookingStatus.CHECKED_IN },
          ],
        });

        if (existingCount >= timeSlotEntity.capacity) {
          throw new BadRequestException("Selected time slot is fully booked");
        }

        // -----------------------------
        // 5. Count TOTAL group size for capacity check
        // -----------------------------
        const totalGroupSizeResult = (await manager
          .createQueryBuilder(Booking, "booking")
          .select("SUM(booking.groupSize)", "totalGroupSize")
          .where("booking.date = :date", { date: bookingDate })
          .andWhere("booking.timeSlot = :timeSlot", { timeSlot: timeSlotEntity.label })
          .andWhere("booking.status IN (:...statuses)", {
            statuses: [
              BookingStatus.SLOT_RESERVED,
              BookingStatus.AWAITING_PAYMENT,
              BookingStatus.PAID,
              BookingStatus.CONFIRMED,
              BookingStatus.CHECKED_IN,
            ],
          })
          .getRawOne()) as { totalGroupSize: string } | null;

        const currentTotalGroupSize = parseInt(totalGroupSizeResult?.totalGroupSize ?? "0") || 0;
        const newTotalAfterReservation = currentTotalGroupSize + reserveSlotDto.groupSize;

        if (newTotalAfterReservation > timeSlotEntity.capacity) {
          throw new BadRequestException(
            `Not enough capacity. Available spots: ${timeSlotEntity.capacity - currentTotalGroupSize}, Requested: ${reserveSlotDto.groupSize}`,
          );
        }

        // -----------------------------
        // 6. Create reservation with expiration time
        // -----------------------------
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.SLOT_RESERVATION_TIMEOUT_MINUTES);

        const booking = manager.create(Booking, {
          date: bookingDate,
          groupSize: reserveSlotDto.groupSize,
          timeSlot: timeSlotEntity.label,
          deposit: reserveSlotDto.deposit ?? 50,
          status: BookingStatus.SLOT_RESERVED,
          expiresAt,
          user: { id: userContext.id } as User,
        });

        const savedBooking = await manager.save(booking);
        this.logger.log("Slot reserved successfully", {
          bookingId: savedBooking.id,
          expiresAt: savedBooking.expiresAt?.toISOString(),
        });
        return savedBooking;
      } catch (error) {
        this.logger.error("Failed to reserve slot", error);

        // Handle specific database constraint errors
        if (error instanceof Error) {
          // Define interface for TypeORM QueryFailedError
          interface QueryFailedError extends Error {
            code?: string;
            constraint?: string;
          }

          const dbError = error as QueryFailedError;

          // Handle unique constraint violations
          if (dbError.code === "23505") {
            if (dbError.constraint === "IDX_booking_user_date_timeslot_unique") {
              throw new BadRequestException(
                "You already have a booking for this time slot. Please check your existing reservations.",
              );
            }
            throw new BadRequestException("This time slot is no longer available. Please select another time slot.");
          }

          // Handle duplicate key violations in general
          if (error.message.includes("duplicate key value violates unique constraint")) {
            if (error.message.includes("user")) {
              throw new BadRequestException("You already have a booking for this time slot.");
            } else {
              throw new BadRequestException("This time slot is no longer available. Please select another time slot.");
            }
          }
        }

        throw error;
      }
    });
  }

  /**
   * Clean up expired slot reservations
   */
  async cleanupExpiredReservations(): Promise<void> {
    const now = new Date();
    const expiredReservations = await this.bookingRepository.find({
      where: {
        status: BookingStatus.SLOT_RESERVED,
        expiresAt: LessThan(now),
      },
    });

    if (expiredReservations.length > 0) {
      await this.bookingRepository.update(
        {
          status: BookingStatus.SLOT_RESERVED,
          expiresAt: LessThan(now),
        },
        {
          status: BookingStatus.SLOT_EXPIRED,
        },
      );

      this.logger.log(`Cleaned up ${expiredReservations.length} expired reservations`);
    }
  }

  /**
   * Cron job to clean up expired reservations every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredReservations(): Promise<void> {
    await this.cleanupExpiredReservations();
  }

  /**
   * Confirm a reserved slot by converting it to AWAITING_PAYMENT
   */
  async confirmReservation(bookingId: string): Promise<Booking> {
    const booking = await this.getBookingById(bookingId);

    if (booking.status !== BookingStatus.SLOT_RESERVED) {
      throw new BadRequestException("Booking is not in reserved status");
    }

    if (booking.expiresAt && booking.expiresAt < new Date()) {
      throw new BadRequestException("Slot reservation has expired");
    }

    booking.status = BookingStatus.AWAITING_PAYMENT;
    booking.expiresAt = undefined; // Remove expiration once confirmed

    return await this.bookingRepository.save(booking);
  }

  /**
   * Cancel a reserved slot and release it for other users
   */
  async cancelReservation(bookingId: string): Promise<Booking> {
    const booking = await this.getBookingById(bookingId);

    // Only allow cancellation of slot reservations and awaiting payment bookings
    if (![BookingStatus.SLOT_RESERVED, BookingStatus.AWAITING_PAYMENT].includes(booking.status)) {
      throw new BadRequestException("Booking cannot be cancelled in its current status");
    }

    // Update booking status to cancelled
    booking.status = BookingStatus.CANCELLED;
    booking.expiresAt = undefined; // Remove expiration since it's cancelled

    this.logger.log(`Cancelled reservation for booking ${bookingId}`);
    return await this.bookingRepository.save(booking);
  }

  /**
   * Get dashboard statistics for a specific user
   */
  async getUserDashboardStats(userId: string): Promise<{
    upcomingTours: number;
    completedTours: number;
    totalBookings: number;
    pendingPayments: number;
  }> {
    const now = new Date();

    // Get all user bookings to calculate stats
    const allBookings = await this.bookingRepository.find({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    // Calculate upcoming tours (confirmed bookings with future dates)
    const upcomingTours = allBookings.filter(
      (booking) => booking.status === BookingStatus.CONFIRMED && new Date(booking.date) >= now,
    ).length;

    // Calculate completed tours
    const completedTours = allBookings.filter((booking) => booking.status === BookingStatus.COMPLETED).length;

    // Total bookings (excluding cancelled and expired)
    const totalBookings = allBookings.filter(
      (booking) => ![BookingStatus.CANCELLED, BookingStatus.SLOT_EXPIRED].includes(booking.status),
    ).length;

    // Pending payments (slot_reserved that haven't expired + awaiting_payment)
    const pendingPayments = allBookings.filter((booking) => {
      if (booking.status === BookingStatus.AWAITING_PAYMENT) {
        return true;
      }

      if (booking.status === BookingStatus.SLOT_RESERVED) {
        // Check if reservation hasn't expired
        if (booking.expiresAt && new Date(booking.expiresAt) > now) {
          return true;
        }
      }

      return false;
    }).length;

    return {
      upcomingTours,
      completedTours,
      totalBookings,
      pendingPayments,
    };
  }

  /**
   * Get recent activity for a specific user
   */
  async getUserActivity(userId: string): Promise<
    {
      id: string;
      type: string;
      description: string;
      timestamp: Date;
    }[]
  > {
    // Get recent bookings for the user
    const recentBookings = await this.bookingRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
      take: 10,
      relations: ["user"],
    });

    // Format activities
    const activities = recentBookings.map((booking) => {
      let description = "";
      switch (booking.status) {
        case BookingStatus.SLOT_RESERVED:
          description = `Reserved slot for ${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot}`;
          break;
        case BookingStatus.AWAITING_PAYMENT:
          description = `Booking confirmed for ${new Date(booking.date).toLocaleDateString()} - awaiting payment`;
          break;
        case BookingStatus.CONFIRMED:
          description = `Payment completed for tour on ${new Date(booking.date).toLocaleDateString()}`;
          break;
        case BookingStatus.COMPLETED:
          description = `Completed tour on ${new Date(booking.date).toLocaleDateString()}`;
          break;
        case BookingStatus.CANCELLED:
          description = `Cancelled booking for ${new Date(booking.date).toLocaleDateString()}`;
          break;
        case BookingStatus.SLOT_EXPIRED:
          description = `Slot reservation expired for ${new Date(booking.date).toLocaleDateString()}`;
          break;
        default:
          description = `Booking created for ${new Date(booking.date).toLocaleDateString()}`;
      }

      return {
        id: `booking-${booking.id}`,
        type: "booking",
        description,
        timestamp: booking.createdAt,
      };
    });

    return activities;
  }
}
