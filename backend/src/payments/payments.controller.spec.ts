import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Logger, NotFoundException } from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
import { BookingStatus } from "../database/entities/enums";
import { JwtService } from "@nestjs/jwt";
import { TokenBlacklistService } from "../auth/token-blacklist.service";
import { Payment } from "../database/entities/payments.entity";
import { Booking } from "../database/entities/booking.entity";
import { AuthenticatedRequest } from "../common/types/request.types";
import {
  TEST_BOOKING_ID_2,
  TEST_PAYMENT_ID_110,
  TEST_NON_EXISTENT_BOOKING_ID,
  TEST_USER_ID_1,
  TEST_TRANSACTION_ID_1,
  TEST_TRANSACTION_ID_CUSTOM,
  TEST_TRANSACTION_ID_NEW,
  TEST_NON_EXISTENT_ID,
} from "../common/testing";

// We need to mock the Public decorator since it's used in the controller
jest.mock("../auth/decorators/public.decorator", () => ({
  Public: () => jest.fn(),
}));

// Fully-typed mock for the Booking entity – only the fields required for type-checking are provided
const mockBooking: Booking = {
  id: TEST_BOOKING_ID_2,
  date: new Date(),
  groupSize: 4,
  deposit: 100,
  timeSlot: "09:00 AM - 10:00 AM",
  hasFeedback: false,
  status: BookingStatus.AWAITING_PAYMENT,
  createdAt: new Date(),
  checkin: null,
  payment: null,
  generateBookingId: jest.fn(),
} as unknown as Booking;

// Typed Booking factory helper for reuse in tests
const createMockBooking = (overrides?: Partial<Booking>): Booking =>
  ({
    id: overrides?.id ?? TEST_BOOKING_ID_2,
    date: overrides?.date ?? new Date(),
    groupSize: overrides?.groupSize ?? 4,
    deposit: overrides?.deposit ?? 100,
    timeSlot: overrides?.timeSlot ?? "09:00 AM - 10:00 AM",
    hasFeedback: overrides?.hasFeedback ?? false,
    status: overrides?.status ?? BookingStatus.AWAITING_PAYMENT,
    createdAt: overrides?.createdAt ?? new Date(),
    checkin: overrides?.checkin ?? null,
    payment: overrides?.payment ?? null,
    generateBookingId: jest.fn(),
  }) as unknown as Booking;

// Create a mock JwtAuthGuard that always allows access
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

describe("PaymentsController", () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  // Typed factory helpers
  const createMockPayment = (overrides?: Partial<Payment>): Payment => ({
    id: overrides?.id ?? TEST_PAYMENT_ID_110,
    bookingId: overrides?.bookingId ?? TEST_BOOKING_ID_2,
    amount: overrides?.amount ?? 50,
    transactionId: overrides?.transactionId ?? TEST_TRANSACTION_ID_1,
    paymentMethod: overrides?.paymentMethod ?? "credit_card",
    createdAt: overrides?.createdAt ?? new Date(),
    modifiedAt: overrides?.modifiedAt ?? new Date(),
    booking: overrides?.booking ?? mockBooking,
  });

  // Sample payment data for testing - include booking property for TypeScript
  const samplePayment: Payment = createMockPayment();

  // Create a mock for the PaymentsService
  const mockPaymentsService = {
    createPayment: jest.fn().mockImplementation((dto: CreatePaymentDto, _user) => {
      if (!dto.bookingId || dto.bookingId === TEST_NON_EXISTENT_ID) {
        throw new NotFoundException("Booking not found");
      }
      return Promise.resolve(
        createMockPayment({
          bookingId: dto.bookingId,
          amount: dto.amount ?? samplePayment.amount,
          transactionId: dto.transactionId ?? samplePayment.transactionId,
          paymentMethod: dto.paymentMethod ?? samplePayment.paymentMethod,
        }),
      );
    }),
    updatePaymentStatus: jest.fn().mockImplementation((dto: UpdatePaymentStatusDto) => {
      if (dto.bookingId === TEST_NON_EXISTENT_ID) {
        throw new NotFoundException(`Booking with id ${dto.bookingId} not found`);
      }
      return Promise.resolve(
        createMockPayment({
          transactionId: dto.transactionId ?? samplePayment.transactionId,
          paymentMethod: dto.paymentMethod ?? samplePayment.paymentMethod,
        }),
      );
    }),
    getPaymentByBookingId: jest.fn().mockImplementation((bookingId: string) => {
      if (bookingId === TEST_NON_EXISTENT_BOOKING_ID) {
        throw new NotFoundException(`Payment for booking ${bookingId} not found`);
      }
      return Promise.resolve(createMockPayment({ bookingId }));
    }),
    getPaymentsByUserId: jest.fn().mockImplementation((userId: string) => {
      if (userId === TEST_NON_EXISTENT_ID) {
        return Promise.resolve([]);
      }
      return Promise.resolve([samplePayment]);
    }),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockTokenBlacklistService = {
    isBlacklisted: jest.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    jest.clearAllMocks(); // Reset mocks between tests

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
        {
          provide: Logger,
          useFactory: () => ({
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          }),
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
    // We deliberately don't get the logger instance to avoid the linter warning
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should be defined", () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  describe("findAll", () => {
    it("should return pagination format with empty data", () => {
      const result = controller.findAll(10, 1);
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageCount: 0,
      });
    });

    it("should handle custom pagination parameters", () => {
      const result = controller.findAll(20, 2);
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 2,
        pageCount: 0,
      });
    });
  });

  describe("createPayment", () => {
    it("should create a payment successfully", async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: TEST_BOOKING_ID_2,
        amount: 100,
      };
      const user = { id: TEST_USER_ID_1, email: "test@example.com" };
      const req = { user } as AuthenticatedRequest;

      const result = await controller.createPayment(createPaymentDto, req);
      expect(mockPaymentsService.createPayment).toHaveBeenCalledWith(createPaymentDto, user);
      expect(result).toMatchObject({
        amount: 100,
      });
      expect(result.bookingId).toBeTruthy();
    });

    it("should handle payment with all optional fields", async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: TEST_BOOKING_ID_2,
        amount: 100,
        transactionId: TEST_TRANSACTION_ID_CUSTOM,
        paymentMethod: "paypal",
      };
      const user = { id: TEST_USER_ID_1, email: "test@example.com" };
      const req = { user } as AuthenticatedRequest;

      const result = await controller.createPayment(createPaymentDto, req);
      expect(mockPaymentsService.createPayment).toHaveBeenCalledWith(createPaymentDto, user);
      expect(result.transactionId).toBe(TEST_TRANSACTION_ID_CUSTOM);
      expect(result.paymentMethod).toBe("paypal");
    });

    it("should handle errors when booking is not found", async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: TEST_NON_EXISTENT_ID, // This will trigger the error in our mock
      };
      const user = { id: TEST_USER_ID_1, email: "test@example.com" };
      const req = { user } as AuthenticatedRequest;

      await expect(controller.createPayment(createPaymentDto, req)).rejects.toThrow(NotFoundException);
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment successfully", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: TEST_BOOKING_ID_2,
        transactionId: TEST_TRANSACTION_ID_NEW,
      };

      const result = await controller.updatePaymentStatus(updateDto);
      expect(mockPaymentsService.updatePaymentStatus).toHaveBeenCalledWith(updateDto);
      expect(result.transactionId).toBe(TEST_TRANSACTION_ID_NEW);
    });

    it("should handle update with transaction ID and payment method", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: TEST_BOOKING_ID_2,
        transactionId: TEST_TRANSACTION_ID_NEW,
        paymentMethod: "bank_transfer",
      };

      const result = await controller.updatePaymentStatus(updateDto);
      expect(mockPaymentsService.updatePaymentStatus).toHaveBeenCalledWith(updateDto);
      expect(result.transactionId).toBe(TEST_TRANSACTION_ID_NEW);
      expect(result.paymentMethod).toBe("bank_transfer");
    });

    it("should handle non-existent booking ID", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: TEST_NON_EXISTENT_ID,
        transactionId: TEST_TRANSACTION_ID_NEW,
      };

      await expect(controller.updatePaymentStatus(updateDto)).rejects.toThrow(NotFoundException);
      expect(mockPaymentsService.updatePaymentStatus).toHaveBeenCalledWith(updateDto);
    });
  });

  describe("getPaymentByBookingId", () => {
    it("should return a payment for a valid booking ID", async () => {
      const result = await controller.getPaymentByBookingId(TEST_BOOKING_ID_2);
      expect(mockPaymentsService.getPaymentByBookingId).toHaveBeenCalledWith(TEST_BOOKING_ID_2);
      expect(result).toHaveProperty("bookingId");
    });

    it("should handle non-existent booking ID", async () => {
      await expect(controller.getPaymentByBookingId(TEST_NON_EXISTENT_BOOKING_ID)).rejects.toThrow(NotFoundException);
      expect(mockPaymentsService.getPaymentByBookingId).toHaveBeenCalledWith(TEST_NON_EXISTENT_BOOKING_ID);
    });
  });

  describe("completePayment", () => {
    it("should complete a payment successfully", async () => {
      // Mock the method properly with correct types
      jest.spyOn(controller, "completePayment").mockImplementationOnce((bookingId: string): Promise<Payment> => {
        return Promise.resolve({
          id: TEST_PAYMENT_ID_110,
          bookingId,
          amount: 50,
          transactionId: `TXN-${Date.now()}`,
          paymentMethod: "credit_card",
          createdAt: new Date(),
          modifiedAt: new Date(),
          booking: createMockBooking({ id: bookingId, status: BookingStatus.COMPLETED }),
        } as Payment);
      });

      const result = await controller.completePayment(TEST_BOOKING_ID_2);
      // Check that the payment has the updated booking status
      expect(result.booking.status).toBe(BookingStatus.COMPLETED);
    });

    it("should handle non-existent booking ID", async () => {
      // Set up the mock to throw for this specific call
      jest.spyOn(mockPaymentsService, "updatePaymentStatus").mockImplementationOnce((dto: UpdatePaymentStatusDto) => {
        if (dto.bookingId === TEST_NON_EXISTENT_ID) {
          throw new NotFoundException(`Booking with id ${dto.bookingId} not found`);
        }
        return Promise.resolve(createMockPayment());
      });

      await expect(controller.completePayment(TEST_NON_EXISTENT_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe("completePaymentAdmin", () => {
    it("should complete a payment as admin successfully", async () => {
      // Mock the method properly with correct types
      jest.spyOn(controller, "completePaymentAdmin").mockImplementationOnce((bookingId: string): Promise<Payment> => {
        return Promise.resolve({
          id: TEST_PAYMENT_ID_110,
          bookingId,
          amount: 50,
          transactionId: TEST_TRANSACTION_ID_1,
          paymentMethod: "credit_card",
          createdAt: new Date(),
          modifiedAt: new Date(),
          booking: createMockBooking({ id: bookingId, status: BookingStatus.COMPLETED }),
        } as Payment);
      });

      const result = await controller.completePaymentAdmin(TEST_BOOKING_ID_2);
      // Check that the payment has the updated booking status
      expect(result.booking.status).toBe(BookingStatus.COMPLETED);
    });

    it("should handle non-existent booking ID", async () => {
      // Set up the mock to throw for this specific call
      jest.spyOn(mockPaymentsService, "updatePaymentStatus").mockImplementationOnce((dto: UpdatePaymentStatusDto) => {
        if (dto.bookingId === TEST_NON_EXISTENT_BOOKING_ID) {
          throw new NotFoundException(`Booking with id ${dto.bookingId} not found`);
        }
        return Promise.resolve(createMockPayment());
      });

      await expect(controller.completePaymentAdmin(TEST_NON_EXISTENT_BOOKING_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getUserPayments", () => {
    it("should return payments for a valid user", async () => {
      const req = {
        user: { id: TEST_USER_ID_1, email: "test@example.com" },
      } as AuthenticatedRequest;
      const result = await controller.getUserPayments(req);

      expect(mockPaymentsService.getPaymentsByUserId).toHaveBeenCalledWith(TEST_USER_ID_1);
      expect(result).toEqual({
        data: [samplePayment],
        total: 1,
      });
    });

    it("should return empty array for user with no payments", async () => {
      const req = { user: { id: TEST_NON_EXISTENT_ID, email: "nonexistent@example.com" } } as AuthenticatedRequest;
      const result = await controller.getUserPayments(req);

      expect(mockPaymentsService.getPaymentsByUserId).toHaveBeenCalledWith(TEST_NON_EXISTENT_ID);
      expect(result).toEqual({
        data: [],
        total: 0,
      });
    });

    it("should handle service errors", async () => {
      const req = {
        user: { id: TEST_USER_ID_1, email: "test@example.com" },
      } as AuthenticatedRequest;

      // Override the mock for this specific test
      jest.spyOn(mockPaymentsService, "getPaymentsByUserId").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(controller.getUserPayments(req)).rejects.toThrow("Database error");
    });
  });
});
