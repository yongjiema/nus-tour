import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsService } from "./payments.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Payment } from "../database/entities/payments.entity";
import { User } from "../database/entities/user.entity";
import { Booking } from "../database/entities/booking.entity";
import { BookingService } from "../booking/booking.service";
import { Logger, NotFoundException, ForbiddenException } from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
import { BookingLifecycleStatus } from "../database/entities/enums";
import { jest } from "@jest/globals";

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
    id: "user-1",
    email: "test@example.com",
  } as unknown as User;

  // Factory helpers ensure we always include mandatory columns/methods
  const createMockBooking = (overrides?: Partial<Booking>): Booking => ({
    id: 123,
    bookingId: "booking-123",
    name: "Test Booking",
    email: "test@example.com",
    deposit: 50,
    status: BookingLifecycleStatus.PENDING_PAYMENT,
    date: new Date("2025-01-01"),
    groupSize: 5,
    timeSlot: "09:00 AM - 10:00 AM",
    hasFeedback: false,
    generateBookingId: jest.fn(),
    createdAt: new Date(),
    checkin: null,
    payment: null,
    ...overrides,
  });

  const createMockPayment = (overrides?: Partial<Payment>): Payment => ({
    id: 1,
    bookingId: 123,
    amount: 50,
    status: BookingLifecycleStatus.PENDING_PAYMENT,
    transactionId: "tx-123",
    paymentMethod: "credit_card",
    createdAt: new Date(),
    updatedAt: new Date(),
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
      getBookingByBookingId: jest.fn(),
      getBookingById: jest.fn(),
      createBooking: jest.fn(),
      findOne: jest.fn(),
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
        bookingId: "booking-123",
        amount: 100,
      };
      const user = { id: "user-1", email: "test@example.com" };

      // Mock booking service to return a booking
      jest.spyOn(bookingService, "getBookingByBookingId").mockResolvedValueOnce(mockBooking);

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

      expect(jest.spyOn(bookingService, "getBookingByBookingId")).toHaveBeenCalledWith("booking-123");
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
        bookingId: "non-existent",
      };
      const user = { id: "user-1", email: "test@example.com" };

      // Mock booking service to throw NotFoundException
      jest
        .spyOn(bookingService, "getBookingByBookingId")
        .mockRejectedValueOnce(new NotFoundException("Booking with booking ID non-existent not found"));

      await expect(service.createPayment(createPaymentDto, user)).rejects.toThrow(NotFoundException);
      expect(jest.spyOn(bookingService, "getBookingByBookingId")).toHaveBeenCalledWith("non-existent");
    });

    it("should throw ForbiddenException when user is not authorized", async () => {
      const createPaymentDto = {
        bookingId: "booking-123",
      };
      const user = { id: "user-2", email: "different@example.com" };

      // Mock booking service to return a booking with different email
      jest.spyOn(bookingService, "getBookingByBookingId").mockResolvedValueOnce(mockBooking);

      await expect(service.createPayment(createPaymentDto, user)).rejects.toThrow(ForbiddenException);
      expect(jest.spyOn(bookingService, "getBookingByBookingId")).toHaveBeenCalledWith("booking-123");
    });

    it("should update existing payment when one exists", async () => {
      const createPaymentDto = {
        bookingId: "booking-123",
        status: BookingLifecycleStatus.PAYMENT_COMPLETED,
      };
      const user = { id: "user-1", email: "test@example.com" };

      // Mock booking service to return a booking
      jest.spyOn(bookingService, "getBookingByBookingId").mockResolvedValueOnce(mockBooking);

      // Mock existing payment
      const findOneSpy2 = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(mockPayment);

      // Mock updated payment
      const _paymentSaveSpy = jest
        .spyOn(paymentsRepository, "save")
        .mockResolvedValue(createMockPayment({ status: BookingLifecycleStatus.PAYMENT_COMPLETED }));

      // Mock finding booking directly
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking);

      const result = await service.createPayment(createPaymentDto, user);

      expect(result.status).toBe(BookingLifecycleStatus.PAYMENT_COMPLETED);
      expect(findOneSpy2).toHaveBeenCalled();
      expect(_paymentSaveSpy).toHaveBeenCalled();
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment status by numeric ID", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: 123,
        status: BookingLifecycleStatus.PAYMENT_COMPLETED,
      };

      // Mock finding booking by ID
      const bookingFindOneSpy = jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking);

      // Mock existing payment
      const paymentFindOneSpy = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(mockPayment);

      // Mock updated payment
      const _paymentSaveSpy = jest
        .spyOn(paymentsRepository, "save")
        .mockResolvedValue(createMockPayment({ status: BookingLifecycleStatus.PAYMENT_COMPLETED }));

      // Mock updated booking
      const _bookingSaveSpy = jest
        .spyOn(bookingRepository, "save")
        .mockResolvedValue(createMockBooking({ status: BookingLifecycleStatus.PAYMENT_COMPLETED }));

      const result = await service.updatePaymentStatus(updateDto);

      expect(bookingFindOneSpy).toHaveBeenCalled();
      expect(paymentFindOneSpy).toHaveBeenCalled();
      expect(result.status).toBe(BookingLifecycleStatus.PAYMENT_COMPLETED);
    });

    it("should update payment status by string ID", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: "booking-123",
        status: BookingLifecycleStatus.PAYMENT_COMPLETED,
      };

      // Mock getting booking by bookingId
      jest.spyOn(bookingService, "getBookingByBookingId").mockResolvedValueOnce(mockBooking);

      // Mock existing payment
      const paymentFindOneSpy2 = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(mockPayment);

      // Mock updated payment
      const _paymentSaveSpy2 = jest
        .spyOn(paymentsRepository, "save")
        .mockResolvedValue(createMockPayment({ status: BookingLifecycleStatus.PAYMENT_COMPLETED }));

      // Mock updated booking
      const _bookingSaveSpy2 = jest
        .spyOn(bookingRepository, "save")
        .mockResolvedValue(createMockBooking({ status: BookingLifecycleStatus.PAYMENT_COMPLETED }));

      const result = await service.updatePaymentStatus(updateDto);

      expect(jest.spyOn(bookingService, "getBookingByBookingId")).toHaveBeenCalledWith("booking-123");
      expect(paymentFindOneSpy2).toHaveBeenCalled();
      expect(result.status).toBe(BookingLifecycleStatus.PAYMENT_COMPLETED);
    });

    it("should create a new payment if none exists", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: 123,
        status: BookingLifecycleStatus.PAYMENT_COMPLETED,
      };

      // Mock finding booking by ID
      const bookingFindOneSpy2 = jest.spyOn(bookingRepository, "findOne").mockResolvedValue(mockBooking);

      // Mock no existing payment
      const paymentFindOneSpy3 = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(null);

      // Mock payment creation
      const paymentCreateSpy = jest.spyOn(paymentsRepository, "create").mockReturnValue(createMockPayment());

      // Mock updated payment
      const _paymentSaveSpy3 = jest
        .spyOn(paymentsRepository, "save")
        .mockResolvedValue(createMockPayment({ status: BookingLifecycleStatus.PAYMENT_COMPLETED }));

      const result = await service.updatePaymentStatus(updateDto);

      expect(paymentCreateSpy).toHaveBeenCalled();
      expect(result.status).toBe(BookingLifecycleStatus.PAYMENT_COMPLETED);
      expect(bookingFindOneSpy2).toHaveBeenCalled();
      expect(paymentFindOneSpy3).toHaveBeenCalled();
    });

    it("should throw NotFoundException when booking is not found", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: 999,
        status: BookingLifecycleStatus.PAYMENT_COMPLETED,
      };

      // Mock not finding booking
      const bookingFindOneSpy2 = jest.spyOn(bookingRepository, "findOne").mockResolvedValue(null);
      const _bookingServiceRejectSpy = jest
        .spyOn(bookingService, "getBookingByBookingId")
        .mockRejectedValueOnce(new NotFoundException("Booking not found"));

      await expect(service.updatePaymentStatus(updateDto)).rejects.toThrow(NotFoundException);
      expect(bookingFindOneSpy2).toHaveBeenCalled();
    });
  });

  describe("getPaymentsByUserId", () => {
    it("should return payments for a user", async () => {
      const userId = "user-1";

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
      const userId = "non-existent";

      // Mock not finding user
      const userFindOneSpy2 = jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

      const result = await service.getPaymentsByUserId(userId);

      expect(userFindOneSpy2).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should return empty array when user has no bookings", async () => {
      const userId = "user-1";

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
      const bookingId = 123;

      // Mock finding booking
      const bookingByIdSpy = jest.spyOn(bookingService, "getBookingById").mockResolvedValueOnce(mockBooking);

      // Mock finding payment
      const paymentFindOneSpy4 = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(mockPayment);

      const result = await service.getPaymentByBookingId(bookingId);

      expect(bookingByIdSpy).toHaveBeenCalledWith(bookingId);
      expect(paymentFindOneSpy4).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    // Updated test to reflect behavior if service does not implement the numeric-to-UUID fallback
    it("should throw NotFoundException if numeric ID lookup fails and service does not fallback", async () => {
      const bookingId = 123;
      const expectedError = new NotFoundException("Not found by numeric ID");

      // Mock failing to find booking by numeric ID
      const bookingByIdRejectSpy = jest.spyOn(bookingService, "getBookingById").mockRejectedValueOnce(expectedError);

      // Spies to ensure fallback and subsequent operations are not called
      const getByBookingIdSpy = jest.spyOn(bookingService, "getBookingByBookingId");
      const paymentsFindOneSpy = jest.spyOn(paymentsRepository, "findOne");

      await expect(service.getPaymentByBookingId(bookingId)).rejects.toThrow(expectedError);

      expect(bookingByIdRejectSpy).toHaveBeenCalledWith(bookingId);
      // Verify that the fallback (string ID lookup) was not attempted
      expect(getByBookingIdSpy).not.toHaveBeenCalled();
      // Verify that payment lookup was not attempted
      expect(paymentsFindOneSpy).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when booking is not found", async () => {
      const bookingId = 999;

      // Mock failing to find booking by any method
      const bookingByIdRejectSpy2 = jest
        .spyOn(bookingService, "getBookingById")
        .mockRejectedValueOnce(new NotFoundException("Not found"));
      const _bookingByBookingIdRejectSpy2 = jest
        .spyOn(bookingService, "getBookingByBookingId")
        .mockRejectedValueOnce(new NotFoundException("Not found"));

      await expect(service.getPaymentByBookingId(bookingId)).rejects.toThrow(NotFoundException);
      expect(bookingByIdRejectSpy2).toHaveBeenCalledWith(bookingId);
    });

    it("should throw NotFoundException when payment is not found", async () => {
      const bookingId = 123;

      // Mock finding booking
      const bookingByIdSpy3 = jest.spyOn(bookingService, "getBookingById").mockResolvedValueOnce(mockBooking);

      // Mock not finding payment
      const paymentsFindOneSpy5 = jest.spyOn(paymentsRepository, "findOne").mockResolvedValue(null);

      await expect(service.getPaymentByBookingId(bookingId)).rejects.toThrow(NotFoundException);
      expect(bookingByIdSpy3).toHaveBeenCalledWith(bookingId);
      expect(paymentsFindOneSpy5).toHaveBeenCalled();
    });
  });
});
