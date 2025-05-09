import { Injectable, NotFoundException, InternalServerErrorException, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingValidationException } from "../common/exceptions/http-exceptions";
import { v4 as uuidv4 } from "uuid";
import { BookingLifecycleStatus } from "../database/entities/enums";
import { Logger } from "@nestjs/common";
import { Payment } from "../database/entities/payments.entity";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @Inject(DataSource)
    private dataSource: DataSource,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      // Validate group size
      if (createBookingDto.groupSize < 1) {
        throw new BookingValidationException("Group size must be at least 1 person");
      }

      if (createBookingDto.groupSize > 50) {
        throw new BookingValidationException("Group size cannot exceed 50 people");
      }

      // Parse the date string explicitly without timezone issues
      const dateParts = createBookingDto.date.split("-");
      if (dateParts.length !== 3) {
        throw new BookingValidationException("Date must be in YYYY-MM-DD format");
      }

      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
      const day = parseInt(dateParts[2], 10);

      const bookingDate = new Date(year, month, day);
      this.logger.log(`Created date from parts: ${year}-${month + 1}-${day} => ${bookingDate.toISOString()}`);

      if (isNaN(bookingDate.getTime())) {
        throw new BookingValidationException("Invalid date format");
      }

      // Get tomorrow's date with timezone handling
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Only compare year, month and day components
      const tomorrowDateOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
      const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());

      this.logger.log(
        `Comparing dates: Booking date (${bookingDateOnly.toISOString().split("T")[0]}) vs Tomorrow (${tomorrowDateOnly.toISOString().split("T")[0]})`,
      );

      if (bookingDateOnly < tomorrowDateOnly) {
        throw new BookingValidationException("Booking date must be from tomorrow onwards");
      }

      const validTimeSlots = [
        "09:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "01:00 PM - 02:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM",
      ];

      if (!validTimeSlots.includes(createBookingDto.timeSlot)) {
        throw new BookingValidationException(`Invalid time slot. Valid options are: ${validTimeSlots.join(", ")}`);
      }

      const existingBookings = await this.bookingRepository.count({
        where: {
          date: bookingDate,
          timeSlot: createBookingDto.timeSlot,
        } as any,
      });

      if (existingBookings >= 3) {
        throw new BookingValidationException(`The selected time slot is fully booked. Please select another time.`);
      }

      const booking = this.bookingRepository.create({
        ...createBookingDto,
        date: bookingDate,
        hasFeedback: false,
        bookingId: uuidv4(),
        status: BookingLifecycleStatus.PENDING_PAYMENT,
      });

      return await this.bookingRepository.save(booking);
    } catch (error) {
      this.logger.error(`Failed to create booking: ${error.message}`, error.stack);
      if (error instanceof BookingValidationException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to create booking");
    }
  }

  async getAvailableTimeSlots(date: string): Promise<{ slot: string; available: number }[]> {
    const allSlots = [
      "09:00 AM - 10:00 AM",
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
      "01:00 PM - 02:00 PM",
      "02:00 PM - 03:00 PM",
      "03:00 PM - 04:00 PM",
    ];

    // Convert string date to Date object for comparison
    const bookingDate = new Date(date);

    const availabilityPromises = allSlots.map(async (slot) => {
      const count = await this.bookingRepository.count({
        where: {
          date: bookingDate,
          timeSlot: slot,
        } as any,
      });
      return { slot, available: 5 - count };
    });

    return Promise.all(availabilityPromises);
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async getAllBookingByEmail(email: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { email },
      order: { createdAt: "DESC" } as any,
      relations: ["payment"],
    });
  }

  async getBookingById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ["payment"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async getBookingByBookingId(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
      relations: ["payment"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with booking ID ${bookingId} not found`);
    }

    return booking;
  }

  async count(): Promise<number> {
    return this.bookingRepository.count();
  }

  async countCompleted(): Promise<number> {
    return this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoin("booking.payment", "payment")
      .where("payment.status = :status", { status: "completed" })
      .getCount();
  }

  async findRecent(limit: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      order: { createdAt: "DESC" } as any,
      take: limit,
    });
  }

  async getBookingByUuid(bookingId: string) {
    return this.bookingRepository.findOne({
      where: { bookingId },
      relations: ["payment"],
    });
  }

  // In booking.service.ts
  async updateBookingStatus(id: string, status: BookingLifecycleStatus) {
    const booking = await this.bookingRepository.findOne({ where: { bookingId: id } });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async updateStatus(bookingId: string, status: BookingLifecycleStatus): Promise<Booking> {
    const booking = await this.getBookingByUuid(bookingId);

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    booking.status = status;

    // Additional logic based on status change (you can customize this)
    switch (status) {
      case BookingLifecycleStatus.PAYMENT_COMPLETED:
        this.logger.log(`Payment completed for booking ${bookingId}`);
        break;
      case BookingLifecycleStatus.CONFIRMED:
        this.logger.log(`Booking ${bookingId} confirmed`);
        break;
      case BookingLifecycleStatus.CHECKED_IN:
        this.logger.log(`Customer checked in for booking ${bookingId}`);
        break;
      case BookingLifecycleStatus.COMPLETED:
        this.logger.log(`Tour completed for booking ${bookingId}`);
        break;
      case BookingLifecycleStatus.CANCELLED:
        this.logger.log(`Booking ${bookingId} cancelled`);
        break;
      case BookingLifecycleStatus.NO_SHOW:
        this.logger.log(`Customer no-show for booking ${bookingId}`);
        break;
      default:
        this.logger.log(`Booking ${bookingId} status updated to ${status}`);
    }

    return this.bookingRepository.save(booking);
  }
  async updatePaymentAndBookingStatus(
    bookingId: string,
    status: BookingLifecycleStatus,
    paymentInfo: {
      transactionId: string;
      amount: number;
      method: string;
      userId: number;
    },
  ) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // 1. Find the booking
        const booking = await manager.findOne(Booking, {
          where: { bookingId },
          relations: ["payment"], // Include payment to check if it exists
        });

        if (!booking) {
          throw new NotFoundException(`Booking with ID ${bookingId} not found`);
        }

        // 2. Update booking status
        booking.status = status;
        await manager.save(Booking, booking);

        // 3. Create or update payment record if status is PAYMENT_COMPLETED
        if (status === BookingLifecycleStatus.PAYMENT_COMPLETED) {
          let payment;

          // Check if payment exists
          if (booking.payment) {
            // Update existing payment
            payment = booking.payment;
            payment.transactionId = paymentInfo.transactionId;
            payment.amount = paymentInfo.amount;
            payment.paymentMethod = paymentInfo.method;
            payment.status = status;
            payment.updatedAt = new Date();
          } else {
            // Create new payment
            payment = new Payment();
            payment.bookingId = booking.id;
            payment.transactionId = paymentInfo.transactionId;
            payment.amount = paymentInfo.amount;
            payment.paymentMethod = paymentInfo.method;
            payment.status = status;
            payment.createdAt = new Date();
            payment.updatedAt = new Date();
          }

          await manager.save(Payment, payment);
        }

        return booking;
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      throw new InternalServerErrorException(`Failed to update payment: ${error.message}`);
    }
  }
}
