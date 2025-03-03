import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from '../database/entities/booking.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';

describe('BookingService', () => {
  let service: BookingService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: Repository<Booking>;

  // Dummy booking objects (simulate current bookings in the "database")
  const bookingArray: Booking[] = [
    {
      id: 1,
      bookingId: 'abc-123',
      name: 'Test1',
      email: 'test1@example.com',
      date: '2025-01-01',
      groupSize: 10,
      deposit: 50,
      timeSlot: '09:00 AM - 10:00 AM',
      paymentStatus: 'pending',
      checkedIn: false,
      generateBookingId: () => {},
    },
    {
      id: 2,
      bookingId: 'def-456',
      name: 'Test2',
      email: 'test2@example.com',
      date: '2025-01-02',
      groupSize: 5,
      deposit: 50,
      timeSlot: '10:00 AM - 11:00 AM',
      paymentStatus: 'pending',
      checkedIn: false,
      generateBookingId: () => {},
    },
  ];

  const mockRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((entity) => {
      return Promise.resolve({ ...entity, id: Math.floor(Math.random() * 1000) });
    }),
    find: jest.fn().mockResolvedValue(bookingArray),
    findOne: jest.fn().mockImplementation(({ where: { id } }) => {
      const found = bookingArray.find((b) => b.id === id);
      return Promise.resolve(found || null);
    }),
    count: jest.fn().mockImplementation(({ where: { date, timeSlot } }) => {
      const count = bookingArray.filter((b) => b.date === date && b.timeSlot === timeSlot).length;
      return Promise.resolve(count);
    }),
  };

  beforeEach(async () => {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBooking', () => {
    it('should create a booking when groupSize is valid', async () => {
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: '2025-01-01',
        groupSize: 5,
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      // Simulate saving the booking
      const savedBooking: Booking = {
        id: 123,
        bookingId: 'abc-123',
        name: createBookingDto.name,
        email: createBookingDto.email,
        date: createBookingDto.date,
        groupSize: createBookingDto.groupSize,
        deposit: createBookingDto.deposit,
        timeSlot: createBookingDto.timeSlot,
        paymentStatus: 'pending',
        checkedIn: false,
        generateBookingId: () => {},
      };

      // Override the save mock for this test
      mockRepository.save.mockResolvedValue(savedBooking);

      const result = await service.createBooking(createBookingDto);
      expect(mockRepository.create).toHaveBeenCalledWith(createBookingDto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedBooking);
    });

    it('should throw BadRequestException if groupSize is invalid', async () => {
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: '2025-01-01',
        groupSize: 0, // invalid because it's below the allowed minimum of 1
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      mockRepository.save.mockImplementation(() => {
        throw new Error('Repository.save should not be called for invalid input.');
      });

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getAvailableTimeSlots', () => {
    it('should return available time slots for a given date', async () => {
      const date = '2025-01-01';

      // The mockRepository.count will calculate based on bookingArray.
      const result = await service.getAvailableTimeSlots(date);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(6);
      // Verify the availability for a specific slot.
      const slotData = result.find((s) => s.slot === '09:00 AM - 10:00 AM');
      const expectedCount = bookingArray.filter((b) => b.date === date && b.timeSlot === '09:00 AM - 10:00 AM').length;
      expect(slotData?.available).toBe(5 - expectedCount);
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      const result = await service.getAllBookings();
      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(bookingArray);
    });
  });

  describe('getBookingById', () => {
    it('should return the booking when found', async () => {
      const result = await service.getBookingById(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(bookingArray[0]);
    });

    it('should return null if booking is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.getBookingById(999);
      expect(result).toBeNull();
    });
  });
});
