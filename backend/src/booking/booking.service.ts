import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingValidationException } from "../common/exceptions/http-exceptions";
import { v4 as uuidv4 } from "uuid";
import { PaymentStatus, BookingStatus } from "../database/entities/enums";
import { Logger } from "@nestjs/common";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
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
        paymentStatus: PaymentStatus.PENDING,
        bookingStatus: BookingStatus.PENDING,
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
}
