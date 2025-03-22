import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Logger, NotFoundException } from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
import { PaymentStatus } from "../database/entities/enums";
import { JwtService } from "@nestjs/jwt";
import { TokenBlacklistService } from "../auth/token-blacklist.service";
import { Payment } from "../database/entities/payments.entity";

// We need to mock the Public decorator since it's used in the controller
jest.mock("../auth/decorators/public.decorator", () => ({
  Public: () => jest.fn(),
}));

// Mock for the Booking entity - needed for the Payment entity
const mockBooking = {
  id: 123,
  bookingId: "booking-123",
  name: "Test Booking",
  email: "test@example.com",
};

// Create a mock JwtAuthGuard that always allows access
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

describe("PaymentsController", () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  // Sample payment data for testing - include booking property for TypeScript
  const samplePayment: Partial<Payment> = {
    id: 1,
    bookingId: 123,
    amount: 50,
    status: PaymentStatus.PENDING,
    transactionId: "tx-123",
    paymentMethod: "credit_card",
    createdAt: new Date(),
    updatedAt: new Date(),
    booking: mockBooking as any,
  };

  // Create a mock for the PaymentsService
  const mockPaymentsService = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createPayment: jest.fn().mockImplementation((dto, user) => {
      if (!dto.bookingId) {
        throw new NotFoundException("Booking not found");
      }
      return Promise.resolve({
        ...samplePayment,
        bookingId: Number(dto.bookingId), // Ensure bookingId is a number
        amount: dto.amount || samplePayment.amount,
        status: dto.status || PaymentStatus.PENDING,
        transactionId: dto.transactionId || samplePayment.transactionId,
        paymentMethod: dto.paymentMethod || samplePayment.paymentMethod,
      });
    }),
    updatePaymentStatus: jest.fn().mockImplementation((dto) => {
      if (dto.bookingId === "non-existent") {
        throw new NotFoundException(`Booking with id ${dto.bookingId} not found`);
      }
      return Promise.resolve({
        ...samplePayment,
        status: dto.status,
        transactionId: dto.transactionId || samplePayment.transactionId,
        paymentMethod: dto.paymentMethod || samplePayment.paymentMethod,
      });
    }),
    getPaymentByBookingId: jest.fn().mockImplementation((bookingId) => {
      if (bookingId === 999 || bookingId === "999") {
        throw new NotFoundException(`Payment for booking ${bookingId} not found`);
      }
      return Promise.resolve({
        ...samplePayment,
        bookingId: Number(bookingId),
      });
    }),
    getPaymentsByUserId: jest.fn().mockImplementation((userId) => {
      if (userId === "non-existent") {
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
    it("should return pagination format with empty data", async () => {
      const result = await controller.findAll(10, 1);
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageCount: 0,
      });
    });

    it("should handle custom pagination parameters", async () => {
      const result = await controller.findAll(20, 2);
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
        bookingId: "123",
        amount: 100,
      };
      const user = { id: "user-1", email: "test@example.com" };
      const req = { user };

      const result = await controller.createPayment(createPaymentDto, req);
      expect(service.createPayment).toHaveBeenCalledWith(createPaymentDto, user);
      expect(result).toMatchObject({
        amount: 100,
      });
      expect(result.bookingId).toBeTruthy();
    });

    it("should handle payment with all optional fields", async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: "123",
        amount: 100,
        status: PaymentStatus.COMPLETED,
        transactionId: "custom-tx-123",
        paymentMethod: "paypal",
      };
      const user = { id: "user-1", email: "test@example.com" };
      const req = { user };

      const result = await controller.createPayment(createPaymentDto, req);
      expect(service.createPayment).toHaveBeenCalledWith(createPaymentDto, user);
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.transactionId).toBe("custom-tx-123");
      expect(result.paymentMethod).toBe("paypal");
    });

    it("should handle errors when booking is not found", async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: undefined, // This will trigger the error in our mock
      };
      const user = { id: "user-1", email: "test@example.com" };
      const req = { user };

      await expect(controller.createPayment(createPaymentDto, req)).rejects.toThrow(NotFoundException);
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment status successfully", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: "123",
        status: PaymentStatus.COMPLETED,
      };

      const result = await controller.updatePaymentStatus(updateDto);
      expect(service.updatePaymentStatus).toHaveBeenCalledWith(updateDto);
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it("should handle update with transaction ID and payment method", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: "123",
        status: PaymentStatus.COMPLETED,
        transactionId: "new-tx-123",
        paymentMethod: "bank_transfer",
      };

      const result = await controller.updatePaymentStatus(updateDto);
      expect(service.updatePaymentStatus).toHaveBeenCalledWith(updateDto);
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.transactionId).toBe("new-tx-123");
      expect(result.paymentMethod).toBe("bank_transfer");
    });

    it("should handle non-existent booking ID", async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: "non-existent",
        status: PaymentStatus.COMPLETED,
      };

      await expect(controller.updatePaymentStatus(updateDto)).rejects.toThrow(NotFoundException);
      expect(service.updatePaymentStatus).toHaveBeenCalledWith(updateDto);
    });
  });

  describe("getPaymentByBookingId", () => {
    it("should return a payment for a valid booking ID", async () => {
      const result = await controller.getPaymentByBookingId("123");
      expect(service.getPaymentByBookingId).toHaveBeenCalledWith(123);
      expect(result).toHaveProperty("bookingId");
    });

    it("should handle non-existent booking ID", async () => {
      await expect(controller.getPaymentByBookingId("999")).rejects.toThrow(NotFoundException);
      expect(service.getPaymentByBookingId).toHaveBeenCalledWith(999);
    });
  });

  describe("completePayment", () => {
    it("should complete a payment successfully", async () => {
      const result = await controller.completePayment("123");
      expect(service.updatePaymentStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: "123",
          status: PaymentStatus.COMPLETED,
          transactionId: expect.stringContaining("TXN-"),
        }),
      );
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it("should handle non-existent booking ID", async () => {
      // Set up the mock to throw for this specific call
      jest.spyOn(service, "updatePaymentStatus").mockImplementationOnce((dto: UpdatePaymentStatusDto) => {
        if (dto.bookingId === "non-existent") {
          throw new NotFoundException(`Booking with id ${dto.bookingId} not found`);
        }
        return Promise.resolve({
          ...samplePayment,
          status: dto.status,
        } as Payment);
      });

      await expect(controller.completePayment("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("completePaymentAdmin", () => {
    it("should complete a payment as admin successfully", async () => {
      const result = await controller.completePaymentAdmin(123);
      expect(service.updatePaymentStatus).toHaveBeenCalledWith({
        bookingId: 123,
        status: PaymentStatus.COMPLETED,
      });
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it("should handle non-existent booking ID", async () => {
      // Set up the mock to throw for this specific call
      jest.spyOn(service, "updatePaymentStatus").mockImplementationOnce((dto: UpdatePaymentStatusDto) => {
        if (dto.bookingId === 999) {
          throw new NotFoundException(`Booking with id ${dto.bookingId} not found`);
        }
        return Promise.resolve({
          ...samplePayment,
          status: dto.status,
        } as Payment);
      });

      await expect(controller.completePaymentAdmin(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getUserPayments", () => {
    it("should return payments for a valid user", async () => {
      const req = { user: { id: "user-1", email: "test@example.com" } };
      const result = await controller.getUserPayments(req);

      expect(service.getPaymentsByUserId).toHaveBeenCalledWith("user-1");
      expect(result).toEqual({
        data: [samplePayment],
        total: 1,
      });
    });

    it("should return empty array for user with no payments", async () => {
      const req = { user: { id: "non-existent", email: "nonexistent@example.com" } };
      const result = await controller.getUserPayments(req);

      expect(service.getPaymentsByUserId).toHaveBeenCalledWith("non-existent");
      expect(result).toEqual({
        data: [],
        total: 0,
      });
    });

    it("should handle service errors", async () => {
      const req = { user: { id: "user-1", email: "test@example.com" } };

      // Override the mock for this specific test
      jest.spyOn(service, "getPaymentsByUserId").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(controller.getUserPayments(req)).rejects.toThrow("Database error");
    });
  });
});
