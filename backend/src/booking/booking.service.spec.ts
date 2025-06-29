import { Test } from "@nestjs/testing";
import { BookingService } from "./booking.service";
import { Repository, DataSource } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException, Logger, BadRequestException } from "@nestjs/common";
import {
  TEST_BOOKING_ID_3,
  TEST_BOOKING_ID_11,
  TEST_BOOKING_ID_10,
  TEST_BOOKING_ID_20,
  TEST_BOOKING_ID_30,
  TEST_BOOKING_ID_40,
  TEST_BOOKING_ID_41,
  TEST_USER_ID_1,
  TEST_USER_ID_2,
} from "../common/testing";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingStatus } from "../database/entities/enums";
import { Checkin } from "../database/entities/checkin.entity";
import { User } from "../database/entities/user.entity";
import { TimeSlot } from "../database/entities/timeSlot.entity";

describe("BookingService", () => {
  let service: BookingService;
  let _repository: Repository<Booking>;
  let _dataSource: DataSource;

  const defaultUser = (): User =>
    ({
      id: TEST_BOOKING_ID_30,
      email: "mock@example.com",
      firstName: "Mock",
      lastName: "User",
      password: "hashed-password",
      roles: [],
      bookings: [],
      comparePassword: jest.fn(),
    }) as unknown as User;

  const createMockBooking = (overrides: Partial<Booking> = {}): Booking =>
    ({
      id: overrides.id ?? TEST_BOOKING_ID_40,
      user: overrides.user ?? defaultUser(),
      date: overrides.date ?? new Date("2025-01-01"),
      groupSize: overrides.groupSize ?? 5,
      deposit: overrides.deposit ?? 50,
      timeSlot: overrides.timeSlot ?? "09:00 AM - 10:00 AM",
      status: overrides.status ?? BookingStatus.AWAITING_PAYMENT,
      hasFeedback: overrides.hasFeedback ?? false,
      checkin: overrides.checkin ?? (null as Checkin | null),
      payment: overrides.payment ?? null,
      createdAt: overrides.createdAt ?? new Date("2023-01-01"),
      generateBookingId: jest.fn(),
    }) as unknown as Booking;

  const bookingArray: Booking[] = [
    createMockBooking({
      id: TEST_BOOKING_ID_10,
      date: new Date("2025-01-01"),
      groupSize: 10,
      user: {
        id: TEST_USER_ID_1,
        email: "test1@example.com",
        firstName: "Test",
        lastName: "1",
      } as unknown as User,
    }),
    createMockBooking({
      id: TEST_BOOKING_ID_20,
      date: new Date("2025-01-02"),
      groupSize: 5,
      status: BookingStatus.PAID,
      user: {
        id: TEST_USER_ID_2,
        email: "test2@example.com",
        firstName: "Test",
        lastName: "2",
      } as unknown as User,
    }),
    createMockBooking({
      id: TEST_BOOKING_ID_11,
      date: new Date("2025-01-03"),
      groupSize: 3,
      user: {
        id: TEST_BOOKING_ID_3,
        email: "test1@example.com",
        firstName: "Test",
        lastName: "3",
      } as unknown as User,
    }),
  ];

  // Mock repository with comprehensive implementations
  const mockRepository = {
    create: jest.fn(
      (dto: CreateBookingDto): Booking =>
        ({
          id: TEST_BOOKING_ID_41,
          date: new Date(dto.date),
          groupSize: dto.groupSize,
          deposit: dto.deposit ?? 50,
          timeSlot: dto.timeSlot,
          status: BookingStatus.AWAITING_PAYMENT,
          hasFeedback: false,
          checkin: null,
          payment: null,
          createdAt: new Date(),
          user: {
            id: TEST_BOOKING_ID_30,
            email: "creator@example.com",
            firstName: "Creator",
            lastName: "User",
          } as unknown as User,
          generateBookingId: jest.fn(),
        }) as unknown as Booking,
    ),
    save: jest.fn((entity: Booking): Promise<Booking> => {
      if (entity.groupSize < 1 || entity.groupSize > 50) {
        // Simulate a repository error if invalid groupSize reaches save,
        // though DTO validation should prevent this.
        throw new Error("Invalid group size passed to repository save method");
      }
      // For the "handle repository errors gracefully" test
      if (entity.deposit === 999) {
        return Promise.reject(new Error("Database error"));
      }
      return Promise.resolve(entity);
    }),
    find: jest
      .fn()
      .mockImplementation((options?: { where?: { user?: { email?: string } }; take?: number }): Promise<Booking[]> => {
        const resolveArray = (arr: Booking[]) => Promise.resolve(arr);
        const email = options?.where?.user?.email;
        if (email) {
          return resolveArray(bookingArray.filter((b) => b.user.email === email));
        }

        const take = options?.take;
        if (typeof take === "number" && !Number.isNaN(take)) {
          return resolveArray(bookingArray.slice(0, take));
        }
        return resolveArray(bookingArray);
      }),
    findOne: jest.fn().mockImplementation((options?: { where?: { id?: string } }): Promise<Booking | null> => {
      const bookingId = options?.where?.id;
      const resolveSingle = (booking: Booking | null) => Promise.resolve(booking);
      if (bookingId) {
        return resolveSingle(bookingArray.find((b) => b.id === bookingId) ?? null);
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

  // Mock TimeSlot repository
  const mockTimeSlotRepository = {
    findOne: jest.fn().mockImplementation(({ where }: { where: { startsAt?: string; endsAt?: string } }) => {
      if (where.startsAt === "09:00:00" && where.endsAt === "10:00:00") {
        return Promise.resolve({
          startsAt: "09:00:00",
          endsAt: "10:00:00",
          capacity: 5,
          label: "09:00 AM - 10:00 AM",
        } as unknown as TimeSlot);
      }
      return Promise.resolve(null);
    }),
    find: jest.fn().mockResolvedValue([
      { startsAt: "09:00:00", endsAt: "10:00:00", capacity: 5, label: "09:00 AM - 10:00 AM" },
      { startsAt: "10:00:00", endsAt: "11:00:00", capacity: 5, label: "10:00 AM - 11:00 AM" },
      { startsAt: "11:00:00", endsAt: "12:00:00", capacity: 5, label: "11:00 AM - 12:00 PM" },
      { startsAt: "13:00:00", endsAt: "14:00:00", capacity: 5, label: "01:00 PM - 02:00 PM" },
      { startsAt: "14:00:00", endsAt: "15:00:00", capacity: 5, label: "02:00 PM - 03:00 PM" },
      { startsAt: "15:00:00", endsAt: "16:00:00", capacity: 5, label: "03:00 PM - 04:00 PM" },
    ] as unknown as TimeSlot[]),
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
          provide: getRepositoryToken(TimeSlot),
          useValue: mockTimeSlotRepository,
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
        date: tomorrowStr,
        groupSize: 5,
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      const savedBooking = {
        id: TEST_BOOKING_ID_41,
        date: new Date(tomorrowStr),
        groupSize: createBookingDto.groupSize,
        deposit: createBookingDto.deposit ?? 50,
        timeSlot: createBookingDto.timeSlot,
        status: BookingStatus.AWAITING_PAYMENT,
        checkin: null,
        hasFeedback: false,
        payment: null,
        createdAt: new Date(),
        user: {
          id: TEST_BOOKING_ID_30,
          email: "creator@example.com",
          firstName: "Creator",
          lastName: "User",
        } as unknown as User,
        generateBookingId: jest.fn(),
      } as unknown as Booking;

      mockRepository.save.mockResolvedValueOnce(savedBooking); // Changed to mockResolvedValueOnce

      const result = await service.createBooking(createBookingDto);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedBooking);
    });

    it("should propagate error from repository if groupSize < 1 and DTO validation is bypassed", async () => {
      const createBookingDto: CreateBookingDto = {
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
        date: tomorrowStr,
        groupSize: 5,
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 50,
      };

      // Mock that time slot is fully booked (5 bookings already exist equal to capacity)
      mockRepository.count.mockResolvedValueOnce(5);

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should handle repository errors gracefully", async () => {
      const createBookingDto: CreateBookingDto = {
        date: tomorrowStr,
        groupSize: 1, // Use a small, valid group size
        timeSlot: "09:00 AM - 10:00 AM",
        deposit: 999, // Special deposit to trigger DB error in mock
      };

      // Ensure the time slot availability check passes
      // Mock count to return 0, indicating the slot is available for a groupSize of 1.
      // MAX_BOOKINGS_PER_SLOT is 3, so availableCount will be 3. groupSize (1) <= availableCount (3)
      mockRepository.count.mockResolvedValueOnce(0);

      // mockRepository.save is already configured to throw "Database error"
      // for entity.deposit === 999
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
      const result = await service.findAll();
      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(bookingArray);
      expect(result.length).toBe(bookingArray.length);
    });
  });

  describe("getAllBookingByEmail", () => {
    it("should return all bookings for a specific email", async () => {
      const email = "test1@example.com";
      const result = await service.findAllByEmail(email);

      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: "DESC" },
          relations: expect.arrayContaining(["payment", "user"]) as unknown as string[],
        }),
      );

      // Should return bookings with matching email
      const emailResults = result.filter((b: Booking) => b.user.email === email);
      expect(emailResults.length).toBe(2);
    });

    it("should return empty array when no bookings exist for email", async () => {
      const email = "nonexistent@example.com";
      mockRepository.find.mockResolvedValueOnce([]);

      const result = await service.findAllByEmail(email);
      expect(result).toEqual([]);
    });
  });

  describe("getBookingById", () => {
    it("should return a booking when found by ID", async () => {
      const bookingId = TEST_BOOKING_ID_10;
      const result = await service.getBookingById(bookingId);

      // Should query repository exactly once with the bookingId
      expect(mockRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: bookingId },
          relations: expect.arrayContaining(["payment", "user"]) as unknown as string[],
        }),
      );

      expect(result).toEqual(bookingArray[0]);
    });

    it("should throw NotFoundException when booking is not found", async () => {
      const bookingId = "nonexistent"; // Non-existent ID
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.getBookingById(bookingId)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getBookingByBookingId", () => {
    it("should return a booking when found by bookingId", async () => {
      const bookingId = TEST_BOOKING_ID_10;
      mockRepository.findOne.mockResolvedValueOnce(bookingArray[0]);

      const result = await service.getBookingById(bookingId);

      expect(mockRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: bookingId },
          relations: expect.arrayContaining(["payment", "user"]) as unknown as string[],
        }),
      );

      expect(result).toEqual(bookingArray[0]);
    });

    it("should throw NotFoundException when booking is not found", async () => {
      const bookingId = "nonexistent"; // Non-existent ID
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.getBookingById(bookingId)).rejects.toThrow(NotFoundException);
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
      const bookingId = TEST_BOOKING_ID_10;
      mockRepository.findOne.mockResolvedValueOnce(bookingArray[0]);

      const result = await service.getBookingByUuid(bookingId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookingId },
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
