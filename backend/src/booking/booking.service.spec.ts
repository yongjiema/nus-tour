import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from '../database/entities/booking.entity';
import { Repository } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingValidationException } from '../common/exceptions/http-exceptions';
import { PaymentStatus, BookingStatus } from '../database/entities/enums';
import { Logger } from '@nestjs/common';

describe('BookingService', () => {
  let service: BookingService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: Repository<Booking>;
  let loggerSpy: jest.SpyInstance;

  // Sample booking objects - using partial objects to avoid type issues
  const bookingArray = [
    {
      id: 1,
      bookingId: 'abc-123',
      name: 'Test1',
      email: 'test1@example.com',
      date: new Date('2025-01-01'),
      groupSize: 10,
      deposit: 50,
      timeSlot: '09:00 AM - 10:00 AM',
      paymentStatus: PaymentStatus.PENDING,
      bookingStatus: BookingStatus.PENDING,
      checkin: false,
      hasFeedback: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      payment: null,
      generateBookingId: jest.fn(),
    },
    {
      id: 2,
      bookingId: 'def-456',
      name: 'Test2',
      email: 'test2@example.com',
      date: new Date('2025-01-02'),
      groupSize: 5,
      deposit: 50,
      timeSlot: '10:00 AM - 11:00 AM',
      paymentStatus: PaymentStatus.COMPLETED,
      bookingStatus: BookingStatus.CONFIRMED,
      checkin: false,
      hasFeedback: false,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      payment: { id: 1, status: PaymentStatus.COMPLETED },
      generateBookingId: jest.fn(),
    },
    {
      id: 3,
      bookingId: 'ghi-789',
      name: 'Test3',
      email: 'test1@example.com', // Same email as Test1 for testing getAllBookingByEmail
      date: new Date('2025-01-03'),
      groupSize: 3,
      deposit: 50,
      timeSlot: '11:00 AM - 12:00 PM',
      paymentStatus: PaymentStatus.PENDING,
      bookingStatus: BookingStatus.PENDING,
      checkin: false,
      hasFeedback: false,
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03'),
      payment: null,
      generateBookingId: jest.fn(),
    },
  ];

  // Mock repository with comprehensive implementations
  const mockRepository = {
    create: jest.fn((dto) => ({
      ...dto,
      id: Math.floor(Math.random() * 1000),
      bookingId: 'test-uuid',
      generateBookingId: jest.fn(),
    })),
    save: jest.fn((entity) => {
      if (entity.groupSize < 1 || entity.groupSize > 50) {
        throw new Error('Invalid group size');
      }
      return Promise.resolve({
        ...entity,
        id: entity.id || Math.floor(Math.random() * 1000),
      });
    }),
    find: jest.fn().mockImplementation((options) => {
      if (options?.where?.email) {
        return Promise.resolve(bookingArray.filter((b) => b.email === options.where.email));
      }
      if (options?.take) {
        return Promise.resolve(bookingArray.slice(0, options.take));
      }
      return Promise.resolve(bookingArray);
    }),
    findOne: jest.fn().mockImplementation((options) => {
      if (options?.where?.id) {
        const found = bookingArray.find((b) => b.id === options.where.id);
        return Promise.resolve(found || null);
      }
      if (options?.where?.bookingId) {
        const found = bookingArray.find((b) => b.bookingId === options.where.bookingId);
        return Promise.resolve(found || null);
      }
      return Promise.resolve(null);
    }),
    count: jest.fn().mockImplementation((options) => {
      if (!options || !options.where) {
        return Promise.resolve(bookingArray.length);
      }

      // Handle date and timeSlot filter for getAvailableTimeSlots
      if (options.where.date && options.where.timeSlot) {
        // Convert date to string for comparison
        const dateStr =
          options.where.date instanceof Date ? options.where.date.toISOString().split('T')[0] : options.where.date;

        const count = bookingArray.filter((b) => {
          const bookingDateStr = b.date instanceof Date ? b.date.toISOString().split('T')[0] : b.date;
          return bookingDateStr === dateStr && b.timeSlot === options.where.timeSlot;
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

  beforeEach(async () => {
    // Create a spy on Logger
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    repository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBooking', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    it('should create a booking when all inputs are valid', async () => {
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: tomorrowStr,
        groupSize: 5,
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      const savedBooking = {
        id: 123,
        bookingId: 'test-uuid',
        name: createBookingDto.name,
        email: createBookingDto.email,
        date: new Date(tomorrowStr),
        groupSize: createBookingDto.groupSize,
        deposit: createBookingDto.deposit,
        timeSlot: createBookingDto.timeSlot,
        paymentStatus: PaymentStatus.PENDING,
        bookingStatus: BookingStatus.PENDING,
        checkin: false,
        hasFeedback: false,
      };

      mockRepository.save.mockResolvedValue(savedBooking);

      const result = await service.createBooking(createBookingDto);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedBooking);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should throw exception when group size is less than 1', async () => {
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: tomorrowStr,
        groupSize: 0, // Invalid
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BookingValidationException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw exception when group size exceeds 50', async () => {
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: tomorrowStr,
        groupSize: 51, // Invalid
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BookingValidationException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw exception for invalid date format', async () => {
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: 'invalid-date', // Invalid format
        groupSize: 5,
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BookingValidationException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw exception when booking date is before tomorrow', async () => {
      const today = new Date().toISOString().split('T')[0];
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: today, // Today, which is invalid
        groupSize: 5,
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BookingValidationException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw exception for invalid time slot', async () => {
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: tomorrowStr,
        groupSize: 5,
        timeSlot: 'Invalid Time', // Invalid slot
        deposit: 50,
      };

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BookingValidationException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw exception when time slot is fully booked', async () => {
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: tomorrowStr,
        groupSize: 5,
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      // Mock that time slot is fully booked (3 bookings already exist)
      mockRepository.count.mockResolvedValueOnce(3);

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BookingValidationException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: tomorrowStr,
        groupSize: 5,
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      // Simulate DB failure
      mockRepository.save.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAvailableTimeSlots', () => {
    it('should return availability for all time slots on a given date', async () => {
      const date = '2025-01-01';
      const result = await service.getAvailableTimeSlots(date);

      expect(result.length).toBe(6); // 6 slots total
      expect(mockRepository.count).toHaveBeenCalledTimes(6); // One call per slot

      // Each result should have slot and available properties
      result.forEach((item) => {
        expect(item).toHaveProperty('slot');
        expect(item).toHaveProperty('available');
        expect(typeof item.available).toBe('number');
      });

      // Verify a specific slot's availability
      const morningSlot = result.find((s) => s.slot === '09:00 AM - 10:00 AM');
      expect(morningSlot.available).toBeDefined();
    });

    it('should handle dates with no bookings', async () => {
      // Mock empty count for every slot
      mockRepository.count.mockResolvedValue(0);

      const date = '2026-01-01'; // Future date with no bookings
      const result = await service.getAvailableTimeSlots(date);

      expect(result.length).toBe(6);
      // Every slot should show full availability (5)
      result.forEach((item) => {
        expect(item.available).toBe(5);
      });
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      const result = await service.getAllBookings();
      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(bookingArray);
      expect(result.length).toBe(bookingArray.length);
    });
  });

  describe('getAllBookingByEmail', () => {
    it('should return all bookings for a specific email', async () => {
      const email = 'test1@example.com';
      const result = await service.getAllBookingByEmail(email);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { email },
        order: { createdAt: 'DESC' },
        relations: ['payment'],
      });

      // Should return bookings with matching email
      expect(result.length).toBe(2); // Two samples have this email
      result.forEach((booking) => {
        expect(booking.email).toBe(email);
      });
    });

    it('should return empty array when no bookings exist for email', async () => {
      const email = 'nonexistent@example.com';
      mockRepository.find.mockResolvedValueOnce([]);

      const result = await service.getAllBookingByEmail(email);
      expect(result).toEqual([]);
    });
  });

  describe('getBookingById', () => {
    it('should return a booking when found by ID', async () => {
      const id = 1;
      const result = await service.getBookingById(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['payment'],
      });

      expect(result).toEqual(bookingArray[0]);
    });

    it('should throw NotFoundException when booking is not found', async () => {
      const id = 999; // Non-existent ID
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.getBookingById(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBookingByBookingId', () => {
    it('should return a booking when found by bookingId', async () => {
      const bookingId = 'abc-123';
      mockRepository.findOne.mockResolvedValueOnce(bookingArray[0]);

      const result = await service.getBookingByBookingId(bookingId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { bookingId },
        relations: ['payment'],
      });

      expect(result).toEqual(bookingArray[0]);
    });

    it('should throw NotFoundException when booking is not found', async () => {
      const bookingId = 'nonexistent'; // Non-existent ID
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.getBookingByBookingId(bookingId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('count', () => {
    it('should return the total number of bookings', async () => {
      mockRepository.count.mockResolvedValueOnce(bookingArray.length);

      const result = await service.count();
      expect(mockRepository.count).toHaveBeenCalled();
      expect(result).toBe(bookingArray.length);
    });
  });

  describe('countCompleted', () => {
    it('should count bookings with completed payment status', async () => {
      const result = await service.countCompleted();

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('booking');
      expect(result).toBe(1); // Mocked to return 1
    });
  });

  describe('findRecent', () => {
    it('should return the most recent bookings limited by count', async () => {
      const limit = 2;
      const result = await service.findRecent(limit);

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: limit,
      });

      expect(result.length).toBeLessThanOrEqual(limit);
    });

    it('should return all bookings if limit exceeds total count', async () => {
      const limit = 10; // More than our sample data
      await service.findRecent(limit);

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: limit,
      });
    });
  });

  describe('getBookingByUuid', () => {
    it('should return a booking when found by UUID', async () => {
      const bookingId = 'abc-123';
      mockRepository.findOne.mockResolvedValueOnce(bookingArray[0]);

      const result = await service.getBookingByUuid(bookingId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { bookingId },
        relations: ['payment'],
      });

      expect(result).toEqual(bookingArray[0]);
    });

    it('should return null when booking is not found', async () => {
      const bookingId = 'nonexistent';
      mockRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.getBookingByUuid(bookingId);
      expect(result).toBeNull();
    });
  });
});
