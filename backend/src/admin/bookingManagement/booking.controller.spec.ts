import { Test, TestingModule } from "@nestjs/testing";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { BookingLifecycleStatus } from "../../database/entities/enums";
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

  const sampleBooking = {
    bookingId: "test-id",
    name: "Test User",
    date: "2023-06-01",
    status: BookingLifecycleStatus.PENDING_PAYMENT,
  };

  const mockBookingService = {
    getFilteredBookings: jest.fn().mockResolvedValue([sampleBooking]),
    updateStatus: jest.fn().mockImplementation((id: string, status: BookingLifecycleStatus) => {
      if (id === "non-existent-id") {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }
      return Promise.resolve({
        ...sampleBooking,
        bookingId: id,
        status: status,
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
        s: JSON.stringify({ $and: [{ status: { $eq: "confirmed" } }] }),
      };
      const result = await controller.getBookings(query);
      // We expect the filterDto to have status = 'confirmed'
      expect(service.getFilteredBookings).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "confirmed",
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

  describe("updateStatus", () => {
    it("should update payment status to completed", async () => {
      const id = "test-id";
      const result = await controller.updateStatus(id, { status: "payment_completed" });
      expect(service.updateStatus).toHaveBeenCalledWith(id, BookingLifecycleStatus.PAYMENT_COMPLETED);
      expect(result).toEqual({
        ...sampleBooking,
        bookingId: id,
        status: BookingLifecycleStatus.PAYMENT_COMPLETED,
      });
    });

    it("should update booking status to confirmed", async () => {
      const id = "booking-id";
      const result = await controller.updateStatus(id, { status: "confirmed" });
      expect(service.updateStatus).toHaveBeenCalledWith(id, BookingLifecycleStatus.CONFIRMED);
      expect(result).toEqual({
        ...sampleBooking,
        bookingId: id,
        status: BookingLifecycleStatus.CONFIRMED,
      });
    });

    it("should update booking status to completed", async () => {
      const id = "booking-id";
      const result = await controller.updateStatus(id, { status: "completed" });
      expect(service.updateStatus).toHaveBeenCalledWith(id, BookingLifecycleStatus.COMPLETED);
      expect(result).toEqual({
        ...sampleBooking,
        bookingId: id,
        status: BookingLifecycleStatus.COMPLETED,
      });
    });

    it("should update booking status to cancelled", async () => {
      const id = "booking-id";
      const result = await controller.updateStatus(id, { status: "cancelled" });
      expect(service.updateStatus).toHaveBeenCalledWith(id, BookingLifecycleStatus.CANCELLED);
      expect(result).toEqual({
        ...sampleBooking,
        bookingId: id,
        status: BookingLifecycleStatus.CANCELLED,
      });
    });

    it("should throw NotFoundException for non-existent booking", async () => {
      await expect(controller.updateStatus("non-existent-id", { status: "confirmed" })).rejects.toThrow(
        NotFoundException,
      );
      expect(service.updateStatus).toHaveBeenCalledWith("non-existent-id", BookingLifecycleStatus.CONFIRMED);
    });
  });
});
