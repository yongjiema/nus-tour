import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsService } from "./payments.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Payment } from "../database/entities/payments.entity";
import { User } from "../database/entities/user.entity";
import { Booking } from "../database/entities/booking.entity";
import { BookingService } from "../booking/booking.service";
import { Logger, NotFoundException, ForbiddenException } from "@nestjs/common";
import {
  TEST_BOOKING_ID_3,
  TEST_NON_EXISTENT_BOOKING_ID,
  TEST_PAYMENT_ID_120,
  TEST_USER_ID_1,
  TEST_USER_ID_2,
  TEST_TRANSACTION_ID_1,
  TEST_TRANSACTION_ID_NEW,
  TEST_TRANSACTION_ID_UPDATED,
  TEST_NON_EXISTENT_ID,
} from "../common/testing";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
import { BookingStatus } from "../database/entities/enums";
import { jest } from "@jest/globals";
import { User as EntityUser } from "../database/entities/user.entity";

type JestMock = ReturnType<typeof jest.fn>;

interface SimpleMockRepository {
  findOne: JestMock;
  create: JestMock;
  save: JestMock;
  find: JestMock;
}

function createMockRepository(): SimpleMockRepository {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };
}

type MockRepo = ReturnType<typeof createMockRepository>;

describe("PaymentsService", () => {
  let service: PaymentsService;
  let paymentsRepository: MockRepo;
  let userRepository: MockRepo;
  let bookingRepository: MockRepo;
  let bookingService: jest.Mocked<BookingService>;

  // Sample test data
  const mockUser = {
    id: TEST_USER_ID_1,
    email: "test@example.com",
  } as unknown as User;

  // Factory helpers ensure we always include mandatory columns/methods
  const createMockBooking = (overrides?: Partial<Booking>): Booking =>
    ({
      id: TEST_BOOKING_ID_3,
      deposit: 50,
      status: BookingStatus.AWAITING_PAYMENT,
      date: new Date("2025-01-01"),
      groupSize: 5,
      timeSlot: "09:00 AM - 10:00 AM",
      hasFeedback: false,
      generateBookingId: jest.fn(),
      createdAt: new Date(),
      checkin: null,
      payment: null,
      user: {
        id: TEST_USER_ID_1,
        email: "test@example.com",
        username: "TestUser",
        password: "hash",
        unhashedPassword: "password",
        roles: [],
        comparePassword: jest.fn(),
      } as unknown as EntityUser,
      ...overrides,
    }) as unknown as Booking;

  const createMockPayment = (overrides?: Partial<Payment>): Payment => ({
    id: TEST_PAYMENT_ID_120,
    bookingId: overrides?.bookingId ?? TEST_BOOKING_ID_3,
    amount: 50,
    transactionId: TEST_TRANSACTION_ID_1,
    paymentMethod: "credit_card",
    createdAt: new Date(),
    modifiedAt: new Date(),
    booking: overrides?.booking ?? (createMockBooking() as unknown as Booking),
    ...overrides,
  });

  const mockBooking = createMockBooking();
  const mockPayment = createMockPayment({ booking: mockBooking });

  beforeEach(async () => {
    // Create mock repositories
    const paymentsRepositoryMock = createMockRepository();
    const userRepositoryMock = createMockRepository();
    const bookingRepositoryMock = createMockRepository();

    // Create mock booking service with proper typings
    const bookingServiceMock: jest.Mocked<BookingService> = {
      getBookingById: jest.fn(),
      getBookingByEmail: jest.fn(),
      getAllBookings: jest.fn(),
      updateBookingStatus: jest.fn(),
      updatePaymentAndBookingStatus: jest.fn(),
    } as unknown as jest.Mocked<BookingService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: paymentsRepositoryMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: bookingRepositoryMock,
        },
        {
          provide: BookingService,
          useValue: bookingServiceMock,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentsRepository = module.get(getRepositoryToken(Payment));
    userRepository = module.get(getRepositoryToken(User));
    bookingRepository = module.get(getRepositoryToken(Booking));
    bookingService = bookingServiceMock;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createPayment", () => {
    it("should create a payment successfully", async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: TEST_BOOKING_ID_3,
        amount: 100,
      };
      const user = { id: TEST_USER_ID_1, email: "test@example.com" };

      // Mock booking service to return a booking
      const bookingServiceSpy = jest.spyOn(bookingService, "getBookingById").mockResolvedValueOnce(mockBooking);

      // Mock no existing payment
      const findOneSpy = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(null);

      // Mock payment creation
      const createSpy = jest
        .spyOn(paymentsRepository, "create")
        .mockReturnValue(createMockPayment({ amount: createPaymentDto.amount ?? 50 }));

      // Mock save operation
      const saveSpy = jest
        .spyOn(paymentsRepository, "save")
        .mockResolvedValue(createMockPayment({ amount: createPaymentDto.amount ?? 50 }));

      const result = await service.createPayment(createPaymentDto, user);

      expect(bookingServiceSpy).toHaveBeenCalledWith(TEST_BOOKING_ID_3);
      expect(findOneSpy).toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toMatchObject({
        bookingId: mockBooking.id,
        amount: 100,
      });
    });

    it("should throw NotFoundException when booking is not found", async () => {
      const createPaymentDto = {
        bookingId: TEST_NON_EXISTENT_ID,
      };
      const user = { id: TEST_USER_ID_1, email: "test@example.com" };

      // Mock booking service to throw NotFoundException
      const bookingServiceRejectSpy = jest
        .spyOn(bookingService, "getBookingById")
        .mockRejectedValueOnce(new NotFoundException("Booking with booking ID non-existent not found"));

      await expect(service.createPayment(createPaymentDto, user)).rejects.toThrow(NotFoundException);
      expect(bookingServiceRejectSpy).toHaveBeenCalledWith(TEST_NON_EXISTENT_ID);
    });

    it("should throw ForbiddenException when user is not authorized", async () => {
      const createPaymentDto = {
        bookingId: TEST_BOOKING_ID_3,
      };
      const user = { id: TEST_USER_ID_2, email: "different@example.com" };

      // Mock booking service to return a booking with different email
      const bookingServiceSpy2 = jest.spyOn(bookingService, "getBookingById").mockResolvedValueOnce(mockBooking);

      await expect(service.createPayment(createPaymentDto, user)).rejects.toThrow(ForbiddenException);
      expect(bookingServiceSpy2).toHaveBeenCalledWith(TEST_BOOKING_ID_3);
    });

    it("should update existing payment when one exists", async () => {
      const createPaymentDto = {
        bookingId: TEST_BOOKING_ID_3,
        transactionId: TEST_TRANSACTION_ID_NEW,
      };
      const user = { id: TEST_USER_ID_1, email: "test@example.com" };

      // Mock booking service to return a booking
      const bookingServiceSpy3 = jest.spyOn(bookingService, "getBookingById").mockResolvedValueOnce(mockBooking);

      // Mock existing payment
      const findOneSpy2 = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(mockPayment);

      // Mock updated payment
      const _paymentSaveSpy = jest
        .spyOn(paymentsRepository, "save")
        .mockResolvedValue(createMockPayment({ transactionId: TEST_TRANSACTION_ID_NEW }));

      const result = await service.createPayment(createPaymentDto, user);

      expect(result.transactionId).toBe(TEST_TRANSACTION_ID_NEW);
      expect(findOneSpy2).toHaveBeenCalled();
      expect(_paymentSaveSpy).toHaveBeenCalled();
      expect(bookingServiceSpy3).toHaveBeenCalledWith(TEST_BOOKING_ID_3);
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment by bookingId", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: TEST_BOOKING_ID_3,
        transactionId: TEST_TRANSACTION_ID_UPDATED,
      };

      // Mock finding booking by bookingId
      const bookingServiceSpy4 = jest.spyOn(bookingService, "getBookingById").mockResolvedValueOnce(mockBooking);

      // Mock existing payment
      const paymentFindOneSpy = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(mockPayment);

      // Mock updated payment
      const _paymentSaveSpy = jest
        .spyOn(paymentsRepository, "save")
        .mockResolvedValue(createMockPayment({ transactionId: TEST_TRANSACTION_ID_UPDATED }));

      const result = await service.updatePaymentStatus(updateDto);

      expect(bookingServiceSpy4).toHaveBeenCalledWith(TEST_BOOKING_ID_3);
      expect(paymentFindOneSpy).toHaveBeenCalled();
      expect(result.transactionId).toBe(TEST_TRANSACTION_ID_UPDATED);
    });

    it("should create a new payment if none exists", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: TEST_BOOKING_ID_3,
        transactionId: TEST_TRANSACTION_ID_UPDATED,
      };

      // Mock booking retrieval via service
      const bookingServiceSpyCreate = jest.spyOn(bookingService, "getBookingById").mockResolvedValueOnce(mockBooking);

      // Mock no existing payment
      const paymentFindOneSpy3 = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(null);

      // Mock payment creation
      const paymentCreateSpy = jest.spyOn(paymentsRepository, "create").mockReturnValue(createMockPayment());

      // Mock updated payment
      const _paymentSaveSpy3 = jest
        .spyOn(paymentsRepository, "save")
        .mockResolvedValue(createMockPayment({ transactionId: TEST_TRANSACTION_ID_UPDATED }));

      const result = await service.updatePaymentStatus(updateDto);

      expect(paymentCreateSpy).toHaveBeenCalled();
      expect(result.transactionId).toBe(TEST_TRANSACTION_ID_UPDATED);
      expect(bookingServiceSpyCreate).toHaveBeenCalled();
      expect(paymentFindOneSpy3).toHaveBeenCalled();
    });

    it("should handle non-existent booking ID when updating payment status", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: TEST_NON_EXISTENT_BOOKING_ID,
        transactionId: TEST_TRANSACTION_ID_UPDATED,
      };

      // Mock service throwing when booking not found
      const bookingServiceRejectSpy = jest
        .spyOn(bookingService, "getBookingById")
        .mockRejectedValueOnce(new NotFoundException("Booking not found"));

      await expect(service.updatePaymentStatus(updateDto)).rejects.toThrow(NotFoundException);
      expect(bookingServiceRejectSpy).toHaveBeenCalled();
    });
  });

  describe("getPaymentsByUserId", () => {
    it("should return payments for a user", async () => {
      const userId = TEST_USER_ID_1;

      // Mock finding user
      const userFindOneSpy = jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);

      // Mock finding bookings
      const bookingFindSpy = jest.spyOn(bookingRepository, "find").mockResolvedValue([mockBooking]);

      // Mock finding payments
      const paymentFindSpy = jest.spyOn(paymentsRepository, "find").mockResolvedValue([mockPayment]);

      const result = await service.getPaymentsByUserId(userId);

      expect(userFindOneSpy).toHaveBeenCalled();
      expect(bookingFindSpy).toHaveBeenCalled();
      expect(paymentFindSpy).toHaveBeenCalled();
      expect(result).toEqual([mockPayment]);
    });

    it("should return empty array when user is not found", async () => {
      const userId = TEST_NON_EXISTENT_ID;

      // Mock not finding user
      const userFindOneSpy2 = jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

      const result = await service.getPaymentsByUserId(userId);

      expect(userFindOneSpy2).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should return empty array when user has no bookings", async () => {
      const userId = TEST_USER_ID_1;

      // Mock finding user
      const userFindOneSpy3 = jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);

      // Mock finding no bookings
      const bookingFindSpy2 = jest.spyOn(bookingRepository, "find").mockResolvedValue([]);

      const result = await service.getPaymentsByUserId(userId);

      expect(bookingFindSpy2).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(userFindOneSpy3).toHaveBeenCalled();
    });
  });

  describe("getPaymentByBookingId", () => {
    it("should return payment for a valid booking ID", async () => {
      const bookingId = TEST_BOOKING_ID_3;

      // Mock finding booking
      const bookingByBookingIdSpy = jest.spyOn(bookingService, "getBookingById").mockResolvedValueOnce(mockBooking);

      // Mock finding payment
      const paymentFindOneSpy4 = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(mockPayment);

      const result = await service.getPaymentByBookingId(bookingId);

      expect(bookingByBookingIdSpy).toHaveBeenCalledWith(bookingId);
      expect(paymentFindOneSpy4).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    // Updated test to reflect behavior if service does not implement the numeric-to-UUID fallback
    it("should throw NotFoundException if numeric ID lookup fails and service does not fallback", async () => {
      const bookingId = TEST_BOOKING_ID_3;
      const expectedError = new NotFoundException("Not found by numeric ID");

      // Mock failing to find booking by numeric ID
      const bookingByBookingIdRejectSpy = jest
        .spyOn(bookingService, "getBookingById")
        .mockRejectedValueOnce(expectedError);

      // Spy to ensure subsequent operations are not called
      const paymentsFindOneSpy = jest.spyOn(paymentsRepository, "findOne");

      await expect(service.getPaymentByBookingId(bookingId)).rejects.toThrow(expectedError);

      expect(bookingByBookingIdRejectSpy).toHaveBeenCalledWith(bookingId);
      // Verify that payment lookup was not attempted
      expect(paymentsFindOneSpy).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when booking is not found", async () => {
      const bookingId = TEST_NON_EXISTENT_BOOKING_ID;

      // Mock failing to find booking
      const bookingByBookingIdRejectSpy2 = jest
        .spyOn(bookingService, "getBookingById")
        .mockRejectedValueOnce(new NotFoundException("Not found"));

      await expect(service.getPaymentByBookingId(bookingId)).rejects.toThrow(NotFoundException);
      expect(bookingByBookingIdRejectSpy2).toHaveBeenCalledWith(bookingId);
    });

    it("should throw NotFoundException when payment is not found", async () => {
      const bookingId = TEST_BOOKING_ID_3;

      // Mock finding booking
      const bookingByBookingIdSpy3 = jest.spyOn(bookingService, "getBookingById").mockResolvedValueOnce(mockBooking);

      // Mock not finding payment
      const paymentsFindOneSpy5 = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(null);

      await expect(service.getPaymentByBookingId(bookingId)).rejects.toThrow(NotFoundException);
      expect(bookingByBookingIdSpy3).toHaveBeenCalledWith(bookingId);
      expect(paymentsFindOneSpy5).toHaveBeenCalled();
    });
  });
});
