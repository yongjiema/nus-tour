import { Test, TestingModule } from "@nestjs/testing";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { Booking } from "../database/entities/booking.entity";
import { BadRequestException, NotFoundException, Logger, ForbiddenException } from "@nestjs/common";
import { AuthenticatedRequest } from "../common/types/request.types";
import { BookingStatus } from "../database/entities/enums";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtService } from "@nestjs/jwt";
import {
  TEST_BOOKING_ID_10,
  TEST_BOOKING_ID_100,
  TEST_BOOKING_ID_20,
  TEST_USER_ID_1,
  TEST_MOCK_USER_ID,
  TEST_ANOTHER_USER_ID,
  TEST_NON_EXISTENT_ID,
} from "../common/testing";
import { TokenBlacklistService } from "../auth/token-blacklist.service";
import { User } from "../common/types/request.types";

// Create a mock JwtAuthGuard that always returns true for canActivate
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

describe("BookingController", () => {
  let controller: BookingController;
  let _bookingService: BookingService;

  const mockBookingService = {
    createBooking: jest.fn(),
    findAll: jest.fn(),
    getBookingById: jest.fn(),
    getAvailableTimeSlots: jest.fn(),
    getAllBookingByUserId: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mock_token"),
    verify: jest.fn().mockReturnValue({ id: TEST_MOCK_USER_ID, email: "test@example.com" }),
  };

  const mockTokenBlacklistService = {
    isBlacklisted: jest.fn().mockReturnValue(false),
    addToBlacklist: jest.fn(),
  };

  const sampleEntityUser = {
    id: TEST_USER_ID_1,
    email: "test@example.com",
    username: "Test User",
    password: "hash",
    unhashedPassword: "password",
    roles: [],
    comparePassword: jest.fn(),
  } as unknown as import("../database/entities/user.entity").User;

  // Mock request object
  const mockRequest = {
    user: { id: TEST_USER_ID_1, email: "test@example.com", username: "Test User" } as User,
  } as unknown as AuthenticatedRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
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
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<BookingController>(BookingController);
    _bookingService = module.get<BookingService>(BookingService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createBooking", () => {
    it("should create a booking successfully", async () => {
      const createBookingDto: CreateBookingDto = {
        date: "2025-01-01",
        groupSize: 5,
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      // Create a booking with correct types
      const booking: Partial<Booking> = {
        id: TEST_BOOKING_ID_10,
        date: new Date(createBookingDto.date),
        groupSize: createBookingDto.groupSize,
        deposit: createBookingDto.deposit,
        timeSlot: createBookingDto.timeSlot,
        status: BookingStatus.AWAITING_PAYMENT,
        hasFeedback: false,
      };

      mockBookingService.createBooking.mockResolvedValue(booking);

      // Pass the mock request object as the second argument
      const result = await controller.createBooking(createBookingDto, mockRequest);
      expect(result).toEqual(booking);

      // The controller should pass a modified version of the DTO to the service
      expect(mockBookingService.createBooking).toHaveBeenCalledWith(createBookingDto, mockRequest.user);
    });

    it("should throw a BadRequestException for invalid booking details", async () => {
      const invalidBookingDto: CreateBookingDto = {
        date: "2025-01-01",
        groupSize: 0,
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      mockBookingService.createBooking.mockRejectedValue(new BadRequestException("Group size must be at least 1"));

      await expect(controller.createBooking(invalidBookingDto, mockRequest)).rejects.toThrow(BadRequestException);
      expect(mockBookingService.createBooking).toHaveBeenCalledWith(invalidBookingDto, mockRequest.user);
    });
  });

  describe("getAvailableTimeSlots", () => {
    it("should return available time slots for a given date", async () => {
      const date = "2025-01-01";
      const availableSlots = [
        { slot: "09:00 AM - 10:00 AM", available: 3 },
        { slot: "10:00 AM - 11:00 AM", available: 5 },
      ];

      mockBookingService.getAvailableTimeSlots.mockResolvedValue(availableSlots);

      const result = await controller.getAvailableTimeSlots(date);
      expect(result).toEqual(availableSlots);
      expect(mockBookingService.getAvailableTimeSlots).toHaveBeenCalledWith(date);
    });
  });

  describe("getAllBookings", () => {
    it("should return a list of all bookings", async () => {
      const bookings: Partial<Booking>[] = [
        {
          id: TEST_BOOKING_ID_10,
          date: new Date("2025-01-01"),
          groupSize: 10,
          deposit: 50,
          timeSlot: "09:00 AM - 10:00 AM",
          status: BookingStatus.AWAITING_PAYMENT,
          hasFeedback: false,
        },
        {
          id: TEST_BOOKING_ID_20,
          date: new Date("2025-01-02"),
          groupSize: 5,
          deposit: 50,
          timeSlot: "10:00 AM - 11:00 AM",
          status: BookingStatus.AWAITING_PAYMENT,
          hasFeedback: false,
        },
      ];

      mockBookingService.findAll.mockResolvedValue(bookings);
      const result = await controller.getAllBookings();
      expect(result).toEqual(bookings);
      expect(mockBookingService.findAll).toHaveBeenCalled();
    });
  });

  describe("getUserBookings", () => {
    it("should return bookings for the authenticated user", async () => {
      const userBookings = [
        {
          id: TEST_BOOKING_ID_100,
          bookingId: TEST_BOOKING_ID_10,
          date: new Date("2025-01-01"),
          status: BookingStatus.AWAITING_PAYMENT,
        },
      ];

      mockBookingService.getAllBookingByUserId.mockResolvedValue(userBookings);

      const result = await controller.getUserBookings(mockRequest);
      expect(result).toEqual({
        data: userBookings,
        total: 1,
      });
      expect(mockBookingService.getAllBookingByUserId).toHaveBeenCalledWith(mockRequest.user.id);
    });
  });

  describe("getBookingById", () => {
    it("should return a booking when found", async () => {
      const bookingId = TEST_BOOKING_ID_10;
      const booking: Partial<Booking> = {
        id: bookingId,
        date: new Date("2025-01-01"),
        groupSize: 10,
        deposit: 50,
        timeSlot: "09:00 AM - 10:00 AM",
        status: BookingStatus.AWAITING_PAYMENT,
        hasFeedback: false,
      };

      mockBookingService.getBookingById.mockResolvedValue(booking);
      const result = await controller.getBookingById(bookingId);
      expect(result).toEqual(booking);
      expect(mockBookingService.getBookingById).toHaveBeenCalledWith(bookingId);
    });

    it("should throw a NotFoundException when booking is not found", async () => {
      const missingBookingId = TEST_NON_EXISTENT_ID;
      mockBookingService.getBookingById.mockRejectedValue(new NotFoundException("Booking not found"));
      await expect(controller.getBookingById(missingBookingId)).rejects.toThrow(NotFoundException);
      expect(mockBookingService.getBookingById).toHaveBeenCalledWith(missingBookingId);
    });
  });

  describe("getBookingByBookingId", () => {
    it("should return a booking when found by booking ID", async () => {
      const bookingId = TEST_BOOKING_ID_10;
      const booking: Partial<Booking> = {
        id: bookingId,
        date: new Date("2025-01-01"),
        status: BookingStatus.AWAITING_PAYMENT,
        user: sampleEntityUser,
      };

      mockBookingService.getBookingById.mockResolvedValue(booking);

      const result = await controller.getBookingByBookingId(bookingId, mockRequest);
      expect(result).toEqual(booking);
      expect(mockBookingService.getBookingById).toHaveBeenCalledWith(bookingId);
    });

    it("should throw ForbiddenException when user does not own the booking", async () => {
      const bookingId = TEST_BOOKING_ID_10;
      const booking: Partial<Booking> = {
        id: bookingId,
        date: new Date("2025-01-01"),
        status: BookingStatus.AWAITING_PAYMENT,
        user: {
          id: TEST_ANOTHER_USER_ID,
          email: "other@example.com",
          username: "Other",
          password: "",
          unhashedPassword: "",
          roles: [],
          comparePassword: jest.fn(),
        } as unknown as import("../database/entities/user.entity").User,
      };

      mockBookingService.getBookingById.mockResolvedValue(booking);

      await expect(controller.getBookingByBookingId(bookingId, mockRequest)).rejects.toThrow(ForbiddenException);
      expect(mockBookingService.getBookingById).toHaveBeenCalledWith(bookingId);
    });

    it("should throw NotFoundException when booking is not found", async () => {
      const bookingId = TEST_BOOKING_ID_10;
      mockBookingService.getBookingById.mockRejectedValue(new NotFoundException("Booking not found"));

      await expect(controller.getBookingByBookingId(bookingId, mockRequest)).rejects.toThrow(NotFoundException);
      expect(mockBookingService.getBookingById).toHaveBeenCalledWith(bookingId);
    });
  });
});
