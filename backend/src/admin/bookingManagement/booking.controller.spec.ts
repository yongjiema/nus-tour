import { Test, TestingModule } from "@nestjs/testing";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { BookingStatus, PaymentStatus } from "../../database/entities/enums";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { NotFoundException } from "@nestjs/common";

// A simple mock guard which always allows access
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

describe("BookingController", () => {
  let controller: BookingController;
  let service: BookingService;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  const sampleBooking = {
    bookingId: "test-id",
    name: "Test User",
    date: "2023-06-01",
    bookingStatus: BookingStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PENDING,
  };

  const mockBookingService = {
    getFilteredBookings: jest.fn().mockResolvedValue([sampleBooking]),
    updatePaymentStatus: jest.fn().mockImplementation((id: string, status: PaymentStatus) => {
      if (id === "non-existent-id") {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }
      return Promise.resolve({
        ...sampleBooking,
        bookingId: id,
        paymentStatus: status,
      });
    }),
    updateBookingStatus: jest.fn().mockImplementation((id: string, status: BookingStatus) => {
      if (id === "non-existent-id") {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }
      return Promise.resolve({
        ...sampleBooking,
        bookingId: id,
        bookingStatus: status,
      });
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();
    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(BookingService);
  });

  describe("getBookings", () => {
    it("should parse query.s and call getFilteredBookings with proper dto", async () => {
      const query = {
        s: JSON.stringify({ $and: [{ bookingStatus: { $eq: "confirmed" } }] }),
      };
      const result = await controller.getBookings(query);
      // We expect the filterDto to have bookingStatus = 'confirmed'
      expect(service.getFilteredBookings).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingStatus: "confirmed",
        }),
      );
      expect(result).toEqual([sampleBooking]);
    });

    it("should return unfiltered bookings if no query.s provided", async () => {
      const query = {}; // no s parameter
      const result = await controller.getBookings(query);
      // When query.s is absent, an empty BookingFilterDto is passed
      expect(service.getFilteredBookings).toHaveBeenCalledWith({});
      expect(result).toEqual([sampleBooking]);
    });

    it("should catch parse errors and still call getFilteredBookings with empty dto", async () => {
      const query = { s: "not-json" };
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await controller.getBookings(query);
      expect(consoleSpy).toHaveBeenCalled();
      expect(service.getFilteredBookings).toHaveBeenCalledWith({});
      expect(result).toEqual([sampleBooking]);
      consoleSpy.mockRestore();
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment status and return updated booking", async () => {
      const id = "test-id";
      const result = await controller.updatePaymentStatus(id, "completed");
      expect(service.updatePaymentStatus).toHaveBeenCalledWith(id, PaymentStatus.COMPLETED);
      expect(result).toEqual({
        ...sampleBooking,
        bookingId: id,
        paymentStatus: PaymentStatus.COMPLETED,
      });
    });

    it("should throw NotFoundException for non-existent booking", async () => {
      await expect(controller.updatePaymentStatus("non-existent-id", "completed")).rejects.toThrow(NotFoundException);
      expect(service.updatePaymentStatus).toHaveBeenCalledWith("non-existent-id", PaymentStatus.COMPLETED);
    });
  });

  describe("updateBookingStatus", () => {
    it("should update booking status to confirmed", async () => {
      const id = "booking-id";
      const result = await controller.updateBookingStatus(id, "confirmed");
      expect(service.updateBookingStatus).toHaveBeenCalledWith(id, BookingStatus.CONFIRMED);
      expect(result).toEqual({
        ...sampleBooking,
        bookingId: id,
        bookingStatus: BookingStatus.CONFIRMED,
      });
    });

    it("should update booking status to completed for check-in", async () => {
      const id = "booking-id";
      const result = await controller.updateBookingStatus(id, "completed");
      expect(service.updateBookingStatus).toHaveBeenCalledWith(id, BookingStatus.COMPLETED);
      expect(result).toEqual({
        ...sampleBooking,
        bookingId: id,
        bookingStatus: BookingStatus.COMPLETED,
      });
    });

    it("should throw NotFoundException for non-existent booking", async () => {
      await expect(controller.updateBookingStatus("non-existent-id", "confirmed")).rejects.toThrow(NotFoundException);
      expect(service.updateBookingStatus).toHaveBeenCalledWith("non-existent-id", BookingStatus.CONFIRMED);
    });
  });
});
