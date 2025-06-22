import { Test } from "@nestjs/testing";
import { BookingService } from "./booking.service";
import { Repository, DataSource } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException, Logger, BadRequestException } from "@nestjs/common";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingLifecycleStatus } from "../database/entities/enums";
import { Checkin } from "../database/entities/checkin.entity";

describe("BookingService", () => {
  let service: BookingService;
  let _repository: Repository<Booking>;
  let _dataSource: DataSource;

  // Factory helper to create full Booking objects
  const createMockBooking = (overrides?: Partial<Booking>): Booking => ({
    id: overrides?.id ?? 1,
    bookingId: overrides?.bookingId ?? "mock-uuid",
    name: overrides?.name ?? "Mock User",
    email: overrides?.email ?? "mock@example.com",
    date: overrides?.date ?? new Date("2025-01-01"),
    groupSize: overrides?.groupSize ?? 5,
    deposit: overrides?.deposit ?? 50,
    timeSlot: overrides?.timeSlot ?? "09:00 AM - 10:00 AM",
    status: overrides?.status ?? BookingLifecycleStatus.PENDING_PAYMENT,
    hasFeedback: overrides?.hasFeedback ?? false,
    checkin: overrides?.checkin ?? (null as Checkin | null),
    payment: overrides?.payment ?? null,
    createdAt: overrides?.createdAt ?? new Date("2023-01-01"),
    generateBookingId: jest.fn(),
  });

  const bookingArray: Booking[] = [
    createMockBooking({
      id: 1,
      bookingId: "abc-123",
      name: "Test1",
      email: "test1@example.com",
      date: new Date("2025-01-01"),
      groupSize: 10,
    }),
    createMockBooking({
      id: 2,
      bookingId: "def-456",
      name: "Test2",
      email: "test2@example.com",
      date: new Date("2025-01-02"),
      groupSize: 5,
      status: BookingLifecycleStatus.COMPLETED,
    }),
    createMockBooking({
      id: 3,
      bookingId: "ghi-789",
      name: "Test3",
      email: "test1@example.com",
      date: new Date("2025-01-03"),
      groupSize: 3,
    }),
  ];

  // Mock repository with comprehensive implementations
  const mockRepository = {
    create: jest.fn(
      (dto: CreateBookingDto): Booking => ({
        id: Math.floor(Math.random() * 1000),
        bookingId: "test-uuid",
        name: dto.name,
        email: dto.email,
        date: new Date(dto.date),
        groupSize: dto.groupSize,
        deposit: dto.deposit ?? 50,
        timeSlot: dto.timeSlot,
        status: BookingLifecycleStatus.PENDING_PAYMENT,
        hasFeedback: false,
        checkin: null,
        payment: null,
        createdAt: new Date(),
        generateBookingId: jest.fn(),
      }),
    ),
    save: jest.fn((entity: Booking): Promise<Booking> => {
      if (entity.groupSize < 1 || entity.groupSize > 50) {
        // Simulate a repository error if invalid groupSize reaches save,
        // though DTO validation should prevent this.
        throw new Error("Invalid group size passed to repository save method");
      }
      // For the "handle repository errors gracefully" test
      if (entity.name === "Test User Force DB Error") {
        return Promise.reject(new Error("Database error"));
      }
      return Promise.resolve(entity);
    }),
    find: jest
      .fn()
      .mockImplementation((options?: { where?: { email?: string }; take?: number }): Promise<Booking[]> => {
        const resolveArray = (arr: Booking[]) => Promise.resolve(arr);
        const email = options?.where?.email;
        if (email) {
          return resolveArray(bookingArray.filter((b) => b.email === email));
        }

        const take = options?.take;
        if (typeof take === "number" && !Number.isNaN(take)) {
          return resolveArray(bookingArray.slice(0, take));
        }
        return resolveArray(bookingArray);
      }),
    findOne: jest
      .fn()
      .mockImplementation((options?: { where?: { id?: number; bookingId?: string } }): Promise<Booking | null> => {
        const resolveSingle = (booking: Booking | null) => Promise.resolve(booking);
        const id = options?.where?.id;
        if (id !== undefined) {
          return resolveSingle(bookingArray.find((b) => b.id === id) ?? null);
        }
        const bookingId = options?.where?.bookingId;
        if (bookingId) {
          return resolveSingle(bookingArray.find((b) => b.bookingId === bookingId) ?? null);
        }
        return resolveSingle(null);
      }),
    count: jest.fn().mockImplementation((options?: { where?: { date?: Date | string; timeSlot?: string } }) => {
      const where = options?.where;
      if (!where) {
        return Promise.resolve(bookingArray.length);
      }

      if (where.date && where.timeSlot) {
        const dateStr = where.date instanceof Date ? where.date.toISOString().split("T")[0] : where.date;

        const count = bookingArray.filter((b) => {
          const bookingDateStr = b.date instanceof Date ? b.date.toISOString().split("T")[0] : b.date;
          return bookingDateStr === dateStr && b.timeSlot === where.timeSlot;
        }).length;
        return Promise.resolve(count);
      }

      return Promise.resolve(0);
    }),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1), // Mock for countCompleted
    }),
  };

  // Mock DataSource
  const mockDataSource = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      manager: {
        save: jest.fn(),
        findOne: jest.fn(),
      },
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    })),
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Logger
    const _mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      setContext: jest.fn(),
    };

    // Using a spy on Logger instance methods instead of mocking the whole class
    jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, "debug").mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, "verbose").mockImplementation(() => undefined);

    const moduleBuilder = Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        Logger,
      ],
    });

    const module = await moduleBuilder.compile();
    service = module.get<BookingService>(BookingService);
    _repository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    _dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createBooking", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    it("should create a booking when all inputs are valid", async () => {
      const createBookingDto: CreateBookingDto = {
        name: "Test User",
        email: "test@example.com",
        date: tomorrowStr,
        groupSize: 5,
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      const savedBooking: Booking = {
        id: 123,
        bookingId: "test-uuid",
        name: createBookingDto.name,
        email: createBookingDto.email,
        date: new Date(tomorrowStr),
        groupSize: createBookingDto.groupSize,
        deposit: createBookingDto.deposit ?? 50,
        timeSlot: createBookingDto.timeSlot,
        status: BookingLifecycleStatus.PENDING_PAYMENT,
        checkin: null,
        hasFeedback: false,
        payment: null,
        createdAt: new Date(),
        generateBookingId: jest.fn(),
      };

      mockRepository.save.mockResolvedValueOnce(savedBooking); // Changed to mockResolvedValueOnce

      const result = await service.createBooking(createBookingDto);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedBooking);
    });

    it("should propagate error from repository if groupSize < 1 and DTO validation is bypassed", async () => {
      const createBookingDto: CreateBookingDto = {
        name: "Test User",
        email: "test@example.com",
        date: tomorrowStr,
        groupSize: 0, // Invalid
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      // If DTO validation is bypassed and invalid groupSize reaches repository.save,
      // the mock is set to throw an error, which the service catches and re-throws
      await expect(service.createBooking(createBookingDto)).rejects.toThrow(
        new Error("Invalid group size passed to repository save method"),
      );
      // save would have been called in this scenario
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should propagate error from repository if groupSize > 50 and DTO validation is bypassed", async () => {
      const createBookingDto: CreateBookingDto = {
        name: "Test User",
        email: "test@example.com",
        date: tomorrowStr,
        groupSize: 51, // Invalid
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      // Similar to the < 1 case, expecting InternalServerErrorException
      await expect(service.createBooking(createBookingDto)).rejects.toThrow(
        new Error("Invalid group size passed to repository save method"),
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should throw BadRequestException for invalid date string causing downstream error", async () => {
      const createBookingDto: CreateBookingDto = {
        name: "Test User",
        email: "test@example.com",
        date: "invalid-date", // Invalid format, will lead to NaN components
        groupSize: 5,
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      // The service's deeper validation will catch NaN components after split
      await expect(service.createBooking(createBookingDto)).rejects.toThrow(
        new BadRequestException(
          "Invalid date components. Ensure YYYY-MM-DD and that year, month, and day are numeric.",
        ),
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should throw exception when booking date is before tomorrow", async () => {
      const today = new Date().toISOString().split("T")[0];
      const createBookingDto: CreateBookingDto = {
        name: "Test User",
        email: "test@example.com",
        date: today, // Today, which is invalid
        groupSize: 5,
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should throw exception for invalid time slot", async () => {
      const createBookingDto: CreateBookingDto = {
        name: "Test User",
        email: "test@example.com",
        date: tomorrowStr,
        groupSize: 5,
        timeSlot: "Invalid Time", // Invalid slot
        deposit: 50,
      };

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should throw exception when time slot is fully booked", async () => {
      const createBookingDto: CreateBookingDto = {
        name: "Test User",
        email: "test@example.com",
        date: tomorrowStr,
        groupSize: 5,
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      // Mock that time slot is fully booked (3 bookings already exist)
      mockRepository.count.mockResolvedValueOnce(3);

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should handle repository errors gracefully", async () => {
      const createBookingDto: CreateBookingDto = {
        name: "Test User Force DB Error", // Special name to trigger DB error in mock
        email: "test@example.com",
        date: tomorrowStr,
        groupSize: 1, // Use a small, valid group size
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      // Ensure the time slot availability check passes
      // Mock count to return 0, indicating the slot is available for a groupSize of 1.
      // MAX_BOOKINGS_PER_SLOT is 3, so availableCount will be 3. groupSize (1) <= availableCount (3)
      mockRepository.count.mockResolvedValueOnce(0);

      // mockRepository.save is already configured to throw "Database error"
      // for entity.name === "Test User Force DB Error"
      await expect(service.createBooking(createBookingDto)).rejects.toThrow(new Error("Database error"));
      expect(mockRepository.save).toHaveBeenCalled(); // Ensure save was actually called
    });
  });

  describe("getAvailableTimeSlots", () => {
    it("should return availability for all time slots on a given date", async () => {
      const date = "2025-01-01";
      const result = await service.getAvailableTimeSlots(date);

      expect(result.length).toBe(6); // 6 slots total
      expect(mockRepository.count).toHaveBeenCalledTimes(6); // One call per slot

      // Each result should have slot and available properties
      result.forEach((item) => {
        expect(item).toHaveProperty("slot");
        expect(item).toHaveProperty("available");
        expect(typeof item.available).toBe("number");
      });

      // Verify a specific slot's availability
      const morningSlot = result.find((s) => s.slot === "09:00 AM - 10:00 AM");
      expect(morningSlot?.available).toBeDefined();
    });

    it("should handle dates with no bookings", async () => {
      // Mock empty count for every slot
      mockRepository.count.mockResolvedValue(0);

      const date = "2026-01-01"; // Future date with no bookings
      const result = await service.getAvailableTimeSlots(date);

      expect(result.length).toBe(6);
      // Every slot should show full availability (5)
      result.forEach((item) => {
        expect(item.available).toBe(5);
      });
    });
  });

  describe("getAllBookings", () => {
    it("should return all bookings", async () => {
      const result = await service.getAllBookings();
      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(bookingArray);
      expect(result.length).toBe(bookingArray.length);
    });
  });

  describe("getAllBookingByEmail", () => {
    it("should return all bookings for a specific email", async () => {
      const email = "test1@example.com";
      const result = await service.getAllBookingByEmail(email);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { email },
        order: { createdAt: "DESC" },
        relations: ["payment"],
      });

      // Should return bookings with matching email
      expect(result.length).toBe(2); // Two samples have this email
      result.forEach((booking) => {
        expect(booking.email).toBe(email);
      });
    });

    it("should return empty array when no bookings exist for email", async () => {
      const email = "nonexistent@example.com";
      mockRepository.find.mockResolvedValueOnce([]);

      const result = await service.getAllBookingByEmail(email);
      expect(result).toEqual([]);
    });
  });

  describe("getBookingById", () => {
    it("should return a booking when found by ID", async () => {
      const id = 1;
      const result = await service.getBookingById(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ["payment"],
      });

      expect(result).toEqual(bookingArray[0]);
    });

    it("should throw NotFoundException when booking is not found", async () => {
      const id = 999; // Non-existent ID
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.getBookingById(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getBookingByBookingId", () => {
    it("should return a booking when found by bookingId", async () => {
      const bookingId = "abc-123";
      mockRepository.findOne.mockResolvedValueOnce(bookingArray[0]);

      const result = await service.getBookingByBookingId(bookingId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { bookingId },
        relations: ["payment"],
      });

      expect(result).toEqual(bookingArray[0]);
    });

    it("should throw NotFoundException when booking is not found", async () => {
      const bookingId = "nonexistent"; // Non-existent ID
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.getBookingByBookingId(bookingId)).rejects.toThrow(NotFoundException);
    });
  });

  describe("count", () => {
    it("should return the total number of bookings", async () => {
      mockRepository.count.mockResolvedValueOnce(bookingArray.length);

      const result = await service.count();
      expect(mockRepository.count).toHaveBeenCalled();
      expect(result).toBe(bookingArray.length);
    });
  });

  describe("countCompleted", () => {
    it("should count bookings with completed payment status", async () => {
      const result = await service.countCompleted();

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("booking");
      expect(result).toBe(1); // Mocked to return 1
    });
  });

  describe("findRecent", () => {
    it("should return the most recent bookings limited by count", async () => {
      const limit = 2;
      const result = await service.findRecent(limit);

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: "DESC" },
        take: limit,
      });

      expect(result.length).toBeLessThanOrEqual(limit);
    });

    it("should return all bookings if limit exceeds total count", async () => {
      const limit = 10; // More than our sample data
      await service.findRecent(limit);

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: "DESC" },
        take: limit,
      });
    });
  });

  describe("getBookingByUuid", () => {
    it("should return a booking when found by UUID", async () => {
      const bookingId = "abc-123";
      mockRepository.findOne.mockResolvedValueOnce(bookingArray[0]);

      const result = await service.getBookingByUuid(bookingId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { bookingId },
        relations: ["payment"],
      });

      expect(result).toEqual(bookingArray[0]);
    });

    it("should return null when booking is not found", async () => {
      const bookingId = "nonexistent";
      mockRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.getBookingByUuid(bookingId);
      expect(result).toBeNull();
    });
  });
});
