import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { TEST_BOOKING_ID_5, TEST_USER_ID_1 } from "../../common/testing";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Booking } from "../../database/entities/booking.entity";
import { BookingStatus } from "../../database/entities/enums";
import type { User } from "../../database/entities/user.entity";

class _MockGuard {
  canActivate() {
    return true;
  }
}

describe("BookingController", () => {
  let controller: BookingController;
  let service: BookingService;

  const mockBooking: Partial<Booking> = {
    id: TEST_BOOKING_ID_5,
    date: new Date("2024-01-15"),
    groupSize: 5,
    status: BookingStatus.CONFIRMED,
    timeSlot: "10:00 AM - 11:00 AM",
    deposit: 50,
    user: {
      id: TEST_USER_ID_1,
      email: "test@example.com",
      password: "hashed-password",
      roles: [],
      comparePassword: jest.fn(),
      firstName: "Test",
      lastName: "User",
    } as unknown as User,
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
      const updatedBooking = { ...mockBooking, status: BookingStatus.CONFIRMED };
      const updateStatusSpy = jest.spyOn(service, "updateStatus").mockResolvedValue(updatedBooking as Booking);

      const result = await controller.updateStatus(TEST_BOOKING_ID_5, { status: "confirmed" });

      expect(result).toEqual(updatedBooking);
      expect(updateStatusSpy).toHaveBeenCalledWith(TEST_BOOKING_ID_5, "confirmed");
    });
  });
});
