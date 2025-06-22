import { Test, TestingModule } from "@nestjs/testing";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { Booking } from "../database/entities/booking.entity";
import { BadRequestException, NotFoundException, Logger, ForbiddenException } from "@nestjs/common";
import { AuthenticatedRequest } from "../common/types/request.types";
import { BookingLifecycleStatus } from "../database/entities/enums";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtService } from "@nestjs/jwt";
import { TokenBlacklistService } from "../auth/token-blacklist.service";

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
    getAllBookings: jest.fn(),
    getBookingById: jest.fn(),
    getAvailableTimeSlots: jest.fn(),
    getAllBookingByEmail: jest.fn(),
    getBookingByBookingId: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mock_token"),
    verify: jest.fn().mockReturnValue({ id: "user_id", email: "test@example.com" }),
  };

  const mockTokenBlacklistService = {
    isBlacklisted: jest.fn().mockReturnValue(false),
    addToBlacklist: jest.fn(),
  };

  // Mock request object
  const mockRequest = {
    user: {
      id: "user-1",
      email: "test@example.com",
      username: "Test User",
    },
  };

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
        name: "Test User",
        email: "test@example.com",
        date: "2025-01-01",
        groupSize: 5,
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      // Create a booking with correct types
      const booking: Partial<Booking> = {
        id: 1,
        bookingId: "abc-123",
        name: createBookingDto.name,
        email: createBookingDto.email,
        date: new Date(createBookingDto.date),
        groupSize: createBookingDto.groupSize,
        deposit: createBookingDto.deposit,
        timeSlot: createBookingDto.timeSlot,
        status: BookingLifecycleStatus.PENDING_PAYMENT,
        hasFeedback: false,
        generateBookingId: jest.fn(),
      };

      mockBookingService.createBooking.mockResolvedValue(booking);

      // Pass the mock request object as the second argument
      const result = await controller.createBooking(createBookingDto, mockRequest as AuthenticatedRequest);
      expect(result).toEqual(booking);

      // The controller should pass a modified version of the DTO to the service
      expect(mockBookingService.createBooking).toHaveBeenCalledWith({
        name: mockRequest.user.username,
        email: mockRequest.user.email,
        date: createBookingDto.date,
        groupSize: createBookingDto.groupSize,
        timeSlot: createBookingDto.timeSlot,
        deposit: createBookingDto.deposit,
      });
    });

    it("should throw a BadRequestException for invalid booking details", async () => {
      const invalidBookingDto: CreateBookingDto = {
        name: "Test User",
        email: "test@example.com",
        date: "2025-01-01",
        groupSize: 0, // invalid because the group size is below the minimum allowed value
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      mockBookingService.createBooking.mockRejectedValue(new BadRequestException("Group size must be at least 1"));

      await expect(controller.createBooking(invalidBookingDto, mockRequest as AuthenticatedRequest)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockBookingService.createBooking).toHaveBeenCalledWith({
        name: mockRequest.user.username,
        email: mockRequest.user.email,
        date: invalidBookingDto.date,
        groupSize: invalidBookingDto.groupSize,
        timeSlot: invalidBookingDto.timeSlot,
        deposit: invalidBookingDto.deposit,
      });
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
          id: 1,
          bookingId: "abc-123",
          name: "Test1",
          email: "test1@example.com",
          date: new Date("2025-01-01"),
          groupSize: 10,
          deposit: 50,
          timeSlot: "09:00 AM - 10:00 AM",
          status: BookingLifecycleStatus.PENDING_PAYMENT,
          hasFeedback: false,
          generateBookingId: jest.fn(),
        },
        {
          id: 2,
          bookingId: "def-456",
          name: "Test2",
          email: "test2@example.com",
          date: new Date("2025-01-02"),
          groupSize: 5,
          deposit: 50,
          timeSlot: "10:00 AM - 11:00 AM",
          status: BookingLifecycleStatus.PENDING_PAYMENT,
          hasFeedback: false,
          generateBookingId: jest.fn(),
        },
      ];

      mockBookingService.getAllBookings.mockResolvedValue(bookings);
      const result = await controller.getAllBookings();
      expect(result).toEqual(bookings);
      expect(mockBookingService.getAllBookings).toHaveBeenCalled();
    });
  });

  describe("getUserBookings", () => {
    it("should return bookings for the authenticated user", async () => {
      const userBookings = [
        {
          id: 1,
          bookingId: "abc-123",
          name: "Test User",
          email: "test@example.com",
          date: new Date("2025-01-01"),
          status: BookingLifecycleStatus.PENDING_PAYMENT,
        },
      ];

      mockBookingService.getAllBookingByEmail.mockResolvedValue(userBookings);

      const result = await controller.getUserBookings(mockRequest as AuthenticatedRequest);
      expect(result).toEqual({
        data: userBookings,
        total: 1,
      });
      expect(mockBookingService.getAllBookingByEmail).toHaveBeenCalledWith(mockRequest.user.email);
    });
  });

  describe("getBookingById", () => {
    it("should return a booking when found", async () => {
      const booking: Partial<Booking> = {
        id: 1,
        bookingId: "abc-123",
        name: "Test1",
        email: "test1@example.com",
        date: new Date("2025-01-01"),
        groupSize: 10,
        deposit: 50,
        timeSlot: "09:00 AM - 10:00 AM",
        status: BookingLifecycleStatus.PENDING_PAYMENT,
        hasFeedback: false,
        generateBookingId: jest.fn(),
      };

      mockBookingService.getBookingById.mockResolvedValue(booking);
      const result = await controller.getBookingById(1);
      expect(result).toEqual(booking);
      expect(mockBookingService.getBookingById).toHaveBeenCalledWith(1);
    });

    it("should throw a NotFoundException when booking is not found", async () => {
      mockBookingService.getBookingById.mockRejectedValue(new NotFoundException("Booking not found"));
      await expect(controller.getBookingById(999)).rejects.toThrow(NotFoundException);
      expect(mockBookingService.getBookingById).toHaveBeenCalledWith(999);
    });
  });

  describe("getBookingByBookingId", () => {
    it("should return a booking when found by booking ID", async () => {
      const bookingId = "abc-123";
      const booking: Partial<Booking> = {
        id: 1,
        bookingId,
        name: "Test User",
        email: mockRequest.user.email,
        date: new Date("2025-01-01"),
        status: BookingLifecycleStatus.PENDING_PAYMENT,
      };

      mockBookingService.getBookingByBookingId.mockResolvedValue(booking);

      const result = await controller.getBookingByBookingId(bookingId, mockRequest as AuthenticatedRequest);
      expect(result).toEqual(booking);
      expect(mockBookingService.getBookingByBookingId).toHaveBeenCalledWith(bookingId);
    });

    it("should throw ForbiddenException when user does not own the booking", async () => {
      const bookingId = "abc-123";
      const booking: Partial<Booking> = {
        id: 1,
        bookingId,
        name: "Test User",
        email: "different@example.com", // Different from the authenticated user
        date: new Date("2025-01-01"),
        status: BookingLifecycleStatus.PENDING_PAYMENT,
      };

      mockBookingService.getBookingByBookingId.mockResolvedValue(booking);

      await expect(controller.getBookingByBookingId(bookingId, mockRequest as AuthenticatedRequest)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockBookingService.getBookingByBookingId).toHaveBeenCalledWith(bookingId);
    });

    it("should throw NotFoundException when booking is not found", async () => {
      const bookingId = "non-existent";
      mockBookingService.getBookingByBookingId.mockRejectedValue(new NotFoundException("Booking not found"));

      await expect(controller.getBookingByBookingId(bookingId, mockRequest as AuthenticatedRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBookingService.getBookingByBookingId).toHaveBeenCalledWith(bookingId);
    });
  });
});
