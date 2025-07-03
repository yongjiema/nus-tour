import { Test, TestingModule } from "@nestjs/testing";
import { BookingService } from "./booking.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Booking } from "../../database/entities/booking.entity";
import { Repository, ObjectLiteral } from "typeorm";
import { BookingStatus } from "../../database/entities/enums";
import { NotFoundException } from "@nestjs/common";
import { TEST_USER_ID_1, TEST_NON_EXISTENT_ID } from "../../common/testing";

type MockRepository<T extends ObjectLiteral = ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("BookingService", () => {
  let service: BookingService;
  let bookingRepository: MockRepository<Booking>;

  // Sample booking data
  const sampleBooking = {
    id: TEST_USER_ID_1,
    name: "Test User",
    date: "2023-06-01",
    // bookingStatus: BookingStatus.PENDING,
    // paymentStatus: PaymentStatus.PENDING,
    status: BookingStatus.AWAITING_PAYMENT,
  };

  beforeEach(async () => {
    const mockBookingRepository = {
      // For findAll()
      find: jest.fn().mockResolvedValue([sampleBooking]),
      // For getFilteredBookings(), we simulate a query builder chain
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getSql: jest.fn().mockReturnValue("SELECT ..."),
        getParameters: jest.fn().mockReturnValue({}),
        getMany: jest.fn().mockResolvedValue([sampleBooking]),
      }),
      // For update methods
      findOne: jest.fn().mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === TEST_NON_EXISTENT_ID) {
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
        status: BookingStatus.AWAITING_PAYMENT,
        date: "2023-06-01",
      };
      const result = await service.getFilteredBookings(filterDto);
      expect(result).toEqual([sampleBooking]);
      expect(bookingRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment status", async () => {
      const result = await service.updatePaymentStatus(TEST_USER_ID_1, BookingStatus.PAID);
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { id: TEST_USER_ID_1 } });
      expect(bookingRepository.save).toHaveBeenCalled();
      expect(result.status).toEqual(BookingStatus.PAID);
    });

    it("should throw NotFoundException for non-existent booking in payment update", async () => {
      await expect(service.updatePaymentStatus(TEST_NON_EXISTENT_ID, BookingStatus.PAID)).rejects.toThrow(
        NotFoundException,
      );
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { id: TEST_NON_EXISTENT_ID } });
      expect(bookingRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("updateBookingStatus", () => {
    it("should update booking status", async () => {
      const result = await service.updateBookingStatus(TEST_USER_ID_1, BookingStatus.CONFIRMED);
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { id: TEST_USER_ID_1 } });
      expect(bookingRepository.save).toHaveBeenCalled();
      expect(result.status).toEqual(BookingStatus.CONFIRMED);
    });

    it("should throw NotFoundException for non-existent booking in status update", async () => {
      await expect(service.updateBookingStatus(TEST_NON_EXISTENT_ID, BookingStatus.CONFIRMED)).rejects.toThrow(
        NotFoundException,
      );
      expect(bookingRepository.findOne).toHaveBeenCalledWith({ where: { id: TEST_NON_EXISTENT_ID } });
      expect(bookingRepository.save).not.toHaveBeenCalled();
    });
  });
});
