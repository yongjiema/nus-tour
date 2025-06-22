import { Test, TestingModule } from "@nestjs/testing";
import { BookingService } from "./booking.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Booking } from "../../database/entities/booking.entity";
import { Repository, ObjectLiteral } from "typeorm";
import { BookingLifecycleStatus } from "../../database/entities/enums";
import { NotFoundException } from "@nestjs/common";

type MockRepository<T extends ObjectLiteral = ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("BookingService", () => {
  let service: BookingService;
  let bookingRepository: MockRepository<Booking>;

  // Sample booking data
  const sampleBooking = {
    id: 1,
    bookingId: "test-booking-123",
    name: "Test User",
    date: "2023-06-01",
    // bookingStatus: BookingStatus.PENDING,
    // paymentStatus: PaymentStatus.PENDING,
    status: BookingLifecycleStatus.PENDING_PAYMENT,
  };

  beforeEach(async () => {
    const mockBookingRepository = {
      // For findAll()
      find: jest.fn().mockResolvedValue([sampleBooking]),
      // For getFilteredBookings(), we simulate a query builder chain
      createQueryBuilder: jest.fn(() => ({
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([sampleBooking]),
        getSql: jest.fn().mockReturnValue("SQL STRING"),
        getParameters: jest.fn().mockReturnValue({}),
      })),
      // For update methods
      findOne: jest.fn().mockImplementation(({ where }: { where: { bookingId: string } }) => {
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
    it("should return filtered bookings based on filterDto", async () => {
      const filterDto = {
        search: "Test",
        // bookingStatus: BookingStatus.PENDING,
        // paymentStatus: PaymentStatus.PENDING,
        status: BookingLifecycleStatus.PENDING_PAYMENT,
        date: "2023-06-01",
      };
      const result = await service.getFilteredBookings(filterDto);
      expect(result).toEqual([sampleBooking]);
      expect(bookingRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment status", async () => {
      const result = await service.updatePaymentStatus("test-booking-123", BookingLifecycleStatus.PAYMENT_COMPLETED);
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { bookingId: "test-booking-123" } });
      expect(bookingRepository.save).toHaveBeenCalled();
      expect(result.status).toEqual(BookingLifecycleStatus.PAYMENT_COMPLETED);
    });

    it("should throw NotFoundException for non-existent booking in payment update", async () => {
      await expect(
        service.updatePaymentStatus("non-existent", BookingLifecycleStatus.PAYMENT_COMPLETED),
      ).rejects.toThrow(NotFoundException);
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { bookingId: "non-existent" } });
      expect(bookingRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("updateBookingStatus", () => {
    it("should update booking status", async () => {
      const result = await service.updateBookingStatus("test-booking-123", BookingLifecycleStatus.CONFIRMED);
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { bookingId: "test-booking-123" } });
      expect(bookingRepository.save).toHaveBeenCalled();
      expect(result.status).toEqual(BookingLifecycleStatus.CONFIRMED);
    });

    it("should throw NotFoundException for non-existent booking in status update", async () => {
      await expect(service.updateBookingStatus("non-existent", BookingLifecycleStatus.CONFIRMED)).rejects.toThrow(
        NotFoundException,
      );
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { bookingId: "non-existent" } });
      expect(bookingRepository.save).not.toHaveBeenCalled();
    });
  });
});
