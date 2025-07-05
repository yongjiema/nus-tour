import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { CheckinService } from "./checkin.service";
import { Booking } from "../database/entities/booking.entity";
import { Checkin } from "../database/entities/checkin.entity";
import { BookingStatus } from "../database/entities/enums";
import { User } from "../database/entities/user.entity";

describe("CheckinService", () => {
  let service: CheckinService;
  let bookingRepository: jest.Mocked<Repository<Booking>>;
  let checkinRepository: jest.Mocked<Repository<Checkin>>;

  beforeEach(async () => {
    const mockBookingRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
    };

    const mockCheckinRepository = {
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckinService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(Checkin),
          useValue: mockCheckinRepository,
        },
      ],
    }).compile();

    service = module.get<CheckinService>(CheckinService);
    bookingRepository = module.get(getRepositoryToken(Booking));
    checkinRepository = module.get(getRepositoryToken(Checkin));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("checkIn", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    } as User;

    const createMockBooking = (overrides: Partial<Booking> = {}): Booking => ({
      id: "booking-1",
      date: new Date(),
      timeSlot: "09:00 - 10:00",
      groupSize: 5,
      deposit: 50,
      hasFeedback: false,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(),
      modifiedAt: new Date(),
      checkin: null,
      payment: null,
      user: mockUser,
      ...overrides,
    });

    it("should successfully check in a valid booking", async () => {
      // Create a booking for today with a time slot that should allow check-in
      const now = new Date();
      const timeSlotStart = new Date(now);
      timeSlotStart.setMinutes(timeSlotStart.getMinutes() + 15); // 15 minutes from now
      const timeSlotEnd = new Date(timeSlotStart);
      timeSlotEnd.setHours(timeSlotEnd.getHours() + 1); // 1 hour duration

      const timeSlot = `${timeSlotStart.getHours().toString().padStart(2, "0")}:${timeSlotStart.getMinutes().toString().padStart(2, "0")} - ${timeSlotEnd.getHours().toString().padStart(2, "0")}:${timeSlotEnd.getMinutes().toString().padStart(2, "0")}`;

      const mockBooking = createMockBooking({
        date: now,
        timeSlot,
      });
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      const mockCheckin = {
        id: "checkin-1",
        booking: mockBooking,
        checkInTime: new Date(),
      } as Checkin;
      checkinRepository.save.mockResolvedValue(mockCheckin);

      const result = await service.checkIn({
        bookingId: "booking-1",
        email: "test@example.com",
      });

      expect(result).toEqual({ message: "Check-in successful" });
      expect(bookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: "booking-1" },
        relations: ["checkin", "user"],
      });
      expect(checkinRepository.save).toHaveBeenCalled();
      expect(bookingRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockBooking.id,
          status: BookingStatus.CHECKED_IN,
        }),
      );
    });

    it("should throw BadRequestException if booking not found", async () => {
      bookingRepository.findOne.mockResolvedValue(null);

      await expect(() =>
        service.checkIn({
          bookingId: "non-existent",
          email: "test@example.com",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if email does not match", async () => {
      const mockBooking = createMockBooking();
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      await expect(() =>
        service.checkIn({
          bookingId: "booking-1",
          email: "wrong@example.com",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if booking is not confirmed", async () => {
      const mockBooking = createMockBooking({
        status: BookingStatus.AWAITING_PAYMENT,
      });
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      await expect(() =>
        service.checkIn({
          bookingId: "booking-1",
          email: "test@example.com",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if already checked in", async () => {
      const mockCheckin = {
        id: "checkin-1",
        checkInTime: new Date(),
      } as Checkin;

      const mockBooking = createMockBooking({
        checkin: mockCheckin,
      });
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      await expect(() =>
        service.checkIn({
          bookingId: "booking-1",
          email: "test@example.com",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if booking is not for today", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockBooking = createMockBooking({
        date: yesterday,
      });
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      await expect(() =>
        service.checkIn({
          bookingId: "booking-1",
          email: "test@example.com",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if check-in is too early", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Create a booking for tomorrow with a time slot that's already past
      const mockBooking = createMockBooking({
        date: tomorrow,
        timeSlot: "08:00 - 09:00", // Assuming current time is much later
      });
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      await expect(() =>
        service.checkIn({
          bookingId: "booking-1",
          email: "test@example.com",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("countPending", () => {
    it("should return count of confirmed bookings", async () => {
      bookingRepository.count.mockResolvedValue(5);

      const result = await service.countPending();

      expect(result).toBe(5);

      expect(bookingRepository.count).toHaveBeenCalledWith({
        where: { status: BookingStatus.CONFIRMED },
      });
    });
  });

  describe("findRecent", () => {
    it("should return recent check-ins", async () => {
      const mockCheckins = [
        { id: "checkin-1", checkInTime: new Date() },
        { id: "checkin-2", checkInTime: new Date() },
      ] as Checkin[];

      checkinRepository.find.mockResolvedValue(mockCheckins);

      const result = await service.findRecent(10);

      expect(result).toEqual(mockCheckins);

      expect(checkinRepository.find).toHaveBeenCalledWith({
        relations: ["booking"],
        order: { createdAt: "DESC" },
        take: 10,
      });
    });
  });

  describe("markNoShowBookings", () => {
    it("should mark confirmed bookings as no-show at end of day", async () => {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const mockBookings = [
        createMockBooking({ id: "booking-1", status: BookingStatus.CONFIRMED }),
        createMockBooking({ id: "booking-2", status: BookingStatus.CONFIRMED }),
      ];

      bookingRepository.find.mockResolvedValue(mockBookings);

      await service.markNoShowBookings();

      expect(bookingRepository.find).toHaveBeenCalledWith({
        where: {
          status: BookingStatus.CONFIRMED,
          date: todayStart,
        },
      });

      expect(bookingRepository.save).toHaveBeenCalledTimes(2);
      expect(mockBookings[0].status).toBe(BookingStatus.NO_SHOW);
      expect(mockBookings[1].status).toBe(BookingStatus.NO_SHOW);
    });
  });

  describe("completeBookingsAfterTimeSlot", () => {
    it("should mark checked-in bookings as completed after time slot ends", async () => {
      const mockBookings = [
        createMockBooking({
          id: "booking-1",
          status: BookingStatus.CHECKED_IN,
          timeSlot: "08:00 - 09:00", // Assuming this has ended
        }),
      ];

      bookingRepository.find.mockResolvedValue(mockBookings);

      // Mock the private method by testing the cron job indirectly
      jest
        .spyOn(service as unknown as { isTimeSlotCompleted: () => boolean }, "isTimeSlotCompleted")
        .mockReturnValue(true);

      await service.completeBookingsAfterTimeSlot();

      expect(bookingRepository.find).toHaveBeenCalled();
      expect(bookingRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockBookings[0].id,
          status: BookingStatus.COMPLETED,
        }),
      );
    });
  });

  // Helper function to create mock booking
  function createMockBooking(overrides: Partial<Booking> = {}): Booking {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    } as User;

    return {
      id: "booking-1",
      date: new Date(),
      timeSlot: "09:00 - 10:00",
      groupSize: 5,
      deposit: 50,
      hasFeedback: false,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(),
      modifiedAt: new Date(),
      checkin: null,
      payment: null,
      user: mockUser,
      ...overrides,
    } as Booking;
  }
});
