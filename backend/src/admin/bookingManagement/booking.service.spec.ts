import { Test, TestingModule } from "@nestjs/testing";
import { BookingService } from "./booking.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Booking } from "../../database/entities/booking.entity";
import { Repository } from "typeorm";
import { BookingStatus } from "../../database/entities/enums";
import { NotFoundException } from "@nestjs/common";

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("BookingService", () => {
  let service: BookingService;
  let bookingRepository: MockRepository<Booking>;

  // Create a sample booking
  const sampleBooking = {
    id: 1,
    bookingId: "test-booking-123",
    name: "Test User",
    bookingStatus: BookingStatus.PENDING,
  };

  beforeEach(async () => {
    // Create our mock repository functions
    const mockBookingRepository = {
      createQueryBuilder: jest.fn(() => ({
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([sampleBooking]),
      })),
      find: jest.fn().mockResolvedValue([sampleBooking]),
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where.bookingId === "non-existent") {
          return Promise.resolve(null);
        }
        return Promise.resolve(sampleBooking);
      }),
      save: jest.fn().mockImplementation((booking) => Promise.resolve(booking)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingRepository = module.get<MockRepository<Booking>>(getRepositoryToken(Booking));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of bookings", async () => {
      const result = await service.findAll();
      expect(result).toEqual([sampleBooking]);
      expect(bookingRepository.find).toHaveBeenCalled();
    });
  });

  describe("getFilteredBookings", () => {
    it("should query bookings with filters", async () => {
      const result = await service.getFilteredBookings("test", "confirmed", "2023-06-01");
      expect(result).toEqual([sampleBooking]);
      expect(bookingRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe("updateBookingStatus", () => {
    it("should update booking status", async () => {
      const result = await service.updateBookingStatus("test-booking-123", BookingStatus.CONFIRMED);
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { bookingId: "test-booking-123" } });
      expect(bookingRepository.save).toHaveBeenCalled();
      expect(result.bookingStatus).toEqual(BookingStatus.CONFIRMED);
    });

    it("should throw NotFoundException for non-existent booking", async () => {
      await expect(service.updateBookingStatus("non-existent", BookingStatus.CONFIRMED)).rejects.toThrow(
        NotFoundException,
      );
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { bookingId: "non-existent" } });
      expect(bookingRepository.save).not.toHaveBeenCalled();
    });
  });
});
