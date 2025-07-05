import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron } from "@nestjs/schedule";
import { Booking } from "../database/entities/booking.entity";
import { Checkin } from "../database/entities/checkin.entity";
import { BookingStatus } from "../database/entities/enums";
import { CheckinDto } from "./dto/checkin.dto";

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
  ) {}

  async checkIn(checkinDto: CheckinDto): Promise<{ message: string }> {
    const { bookingId, email } = checkinDto;
    this.logger.log(`Attempting check-in for bookingId: ${bookingId}`);

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ["checkin", "user"],
    });

    if (!booking) {
      this.logger.warn(`Booking with id ${bookingId} not found.`);
      throw new BadRequestException("Invalid booking details.");
    }

    if (booking.user.email !== email) {
      this.logger.warn(`Email mismatch for bookingId ${bookingId}: Expected ${booking.user.email}, got ${email}`);
      throw new BadRequestException("Invalid booking details.");
    }

    // Check if booking is in confirmed status
    if (booking.status !== BookingStatus.CONFIRMED) {
      this.logger.warn(`Booking ${bookingId} is not confirmed. Current status: ${booking.status}`);
      throw new BadRequestException("Only confirmed bookings can be checked in.");
    }

    if (booking.checkin) {
      this.logger.warn(`Booking ${bookingId} has already been checked in.`);
      throw new BadRequestException("Booking has already been checked in.");
    }

    // Check if the booking is for today or a valid check-in time
    const bookingDate = new Date(booking.date);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const bookingDateStart = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());

    if (bookingDateStart.getTime() !== todayStart.getTime()) {
      this.logger.warn(
        `Check-in attempted for non-today booking: ${bookingId}, booking date: ${booking.date.toISOString()}`,
      );
      throw new BadRequestException("Check-in is only available on the tour date.");
    }

    // Validate that check-in is happening during or before the time slot
    const currentTime = new Date();
    const timeSlotParts = booking.timeSlot.split(" - ");
    if (timeSlotParts.length >= 1) {
      const [startTime] = timeSlotParts;
      const [hours, minutes] = startTime.split(":").map(Number);
      const timeSlotDate = new Date(today);
      timeSlotDate.setHours(hours, minutes, 0, 0);

      // Allow check-in from 30 minutes before the time slot to end of day
      timeSlotDate.setMinutes(timeSlotDate.getMinutes() - 30);

      if (currentTime < timeSlotDate) {
        this.logger.warn(
          `Check-in attempted too early for booking ${bookingId}: ${currentTime.toISOString()} < ${timeSlotDate.toISOString()}`,
        );
        throw new BadRequestException("Check-in is only available 30 minutes before your time slot.");
      }
    }

    // Create a new Checkin entity (audit trail only)
    const checkin = new Checkin();
    checkin.booking = booking;
    checkin.checkInTime = new Date();

    // Save the checkin entity
    await this.checkinRepository.save(checkin);

    // Update booking status to CHECKED_IN for now, will be COMPLETED later based on time slot completion
    booking.status = BookingStatus.CHECKED_IN;
    await this.bookingRepository.save(booking);

    this.logger.log(`Booking ${bookingId} successfully checked in.`);
    return { message: "Check-in successful" };
  }

  async countPending(): Promise<number> {
    return this.bookingRepository.count({
      where: { status: BookingStatus.CONFIRMED },
    });
  }

  async findRecent(limit: number): Promise<Checkin[]> {
    return this.checkinRepository.find({
      relations: ["booking"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  /**
   * Complete checked-in bookings after their time slot ends
   * Runs every hour to check for completed time slots
   */
  @Cron("0 * * * *") // Run every hour
  async completeBookingsAfterTimeSlot(): Promise<void> {
    this.logger.log("Running hourly check to complete bookings after time slot");

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
      // Find all checked-in bookings for today
      const checkedInBookings = await this.bookingRepository.find({
        where: {
          status: BookingStatus.CHECKED_IN,
          date: today,
        },
      });

      for (const booking of checkedInBookings) {
        if (this.isTimeSlotCompleted(booking.timeSlot, now)) {
          booking.status = BookingStatus.COMPLETED;
          await this.bookingRepository.save(booking);
          this.logger.log(`Booking ${booking.id} marked as completed after time slot ended`);
        }
      }
    } catch (error) {
      this.logger.error("Error in completeBookingsAfterTimeSlot cron job:", error);
    }
  }

  /**
   * Mark confirmed bookings as no-show at end of day
   * Runs at 11:59 PM every day
   */
  @Cron("59 23 * * *") // Run at 11:59 PM every day
  async markNoShowBookings(): Promise<void> {
    this.logger.log("Running end-of-day check for no-show bookings");

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    try {
      // Find all confirmed bookings for today that were not checked in
      const confirmedBookings = await this.bookingRepository.find({
        where: {
          status: BookingStatus.CONFIRMED,
          date: todayStart,
        },
      });

      for (const booking of confirmedBookings) {
        booking.status = BookingStatus.NO_SHOW;
        await this.bookingRepository.save(booking);
        this.logger.log(`Booking ${booking.id} marked as no-show for ${booking.date.toISOString()}`);
      }

      this.logger.log(`Marked ${confirmedBookings.length} bookings as no-show for ${todayStart.toDateString()}`);
    } catch (error) {
      this.logger.error("Error in markNoShowBookings cron job:", error);
    }
  }

  /**
   * Helper method to check if a time slot has completed
   */
  private isTimeSlotCompleted(timeSlot: string, currentTime: Date): boolean {
    try {
      // Parse time slot format like "09:00 - 10:00" or "14:30 - 16:00"
      const timeSlotParts = timeSlot.split(" - ");
      if (timeSlotParts.length < 2) {
        return false;
      }

      const [, endTime] = timeSlotParts;
      const [hours, minutes] = endTime.split(":").map(Number);

      const endDateTime = new Date(currentTime);
      endDateTime.setHours(hours, minutes, 0, 0);

      return currentTime > endDateTime;
    } catch (error) {
      this.logger.error(`Error parsing time slot ${timeSlot}:`, error);
      return false;
    }
  }
}
