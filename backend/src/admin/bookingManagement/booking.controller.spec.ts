import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Booking } from "../../database/entities/booking.entity";
import { BookingLifecycleStatus } from "../../database/entities/enums";

class _MockGuard {
  canActivate() {
    return true;
  }
}

describe("BookingController", () => {
  let controller: BookingController;
  let service: BookingService;

  const mockBooking: Partial<Booking> = {
    bookingId: "test-booking-id",
    name: "Test User",
    email: "test@example.com",
    date: new Date("2024-01-15"),
    groupSize: 5,
    status: BookingLifecycleStatus.CONFIRMED,
    timeSlot: "10:00 AM - 11:00 AM",
    deposit: 50,
  };

  const mockService = {
    getFilteredBookings: jest.fn(),
    updateStatus: jest.fn(),
    findAll: jest.fn(),
    updatePaymentStatus: jest.fn(),
    updateBookingStatus: jest.fn(),
  };

  beforeEach(async () => {
    // Silence Logger.error for cleaner test output
    jest.spyOn(Logger.prototype, "error").mockImplementation(jest.fn());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(_MockGuard)
      .compile();

    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(BookingService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getBookings", () => {
    it("should return filtered bookings with search parameter", async () => {
      const getFilteredBookingsSpy = jest
        .spyOn(service, "getFilteredBookings")
        .mockResolvedValue([mockBooking as Booking]);

      const query = {
        s: JSON.stringify({
          $and: [{ search: { $contL: "test" } }],
        }),
      };

      const result = await controller.getBookings(query);

      expect(result).toEqual([mockBooking]);
      expect(getFilteredBookingsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "test",
        }),
      );
    });

    it("should return filtered bookings with status parameter", async () => {
      const getFilteredBookingsSpy = jest
        .spyOn(service, "getFilteredBookings")
        .mockResolvedValue([mockBooking as Booking]);

      const query = {
        s: JSON.stringify({
          $and: [{ status: { $eq: "confirmed" } }],
        }),
      };

      const result = await controller.getBookings(query);

      expect(result).toEqual([mockBooking]);
      expect(getFilteredBookingsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "confirmed",
        }),
      );
    });

    it("should throw BadRequestException for invalid JSON", async () => {
      const query = { s: "invalid-json" };

      await expect(controller.getBookings(query)).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateStatus", () => {
    it("should update booking status", async () => {
      const updatedBooking = { ...mockBooking, status: BookingLifecycleStatus.CONFIRMED };
      const updateStatusSpy = jest.spyOn(service, "updateStatus").mockResolvedValue(updatedBooking as Booking);

      const result = await controller.updateStatus("test-booking-id", { status: "confirmed" });

      expect(result).toEqual(updatedBooking);
      expect(updateStatusSpy).toHaveBeenCalledWith("test-booking-id", "confirmed");
    });
  });
});
