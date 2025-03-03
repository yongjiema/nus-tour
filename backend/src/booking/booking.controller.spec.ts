import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from '../database/entities/booking.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BookingController', () => {
  let controller: BookingController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let bookingService: BookingService;

  const mockBookingService = {
    createBooking: jest.fn(),
    getAllBookings: jest.fn(),
    getBookingById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    bookingService = module.get<BookingService>(BookingService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const createBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: '2025-01-01',
        groupSize: 5,
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      const booking: Booking = {
        id: 1,
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

      mockBookingService.createBooking.mockResolvedValue(booking);

      const result = await controller.createBooking(createBookingDto);
      expect(result).toEqual(booking);
      expect(mockBookingService.createBooking).toHaveBeenCalledWith(createBookingDto);
    });

    it('should throw a BadRequestException for invalid booking details', async () => {
      const invalidBookingDto: CreateBookingDto = {
        name: 'Test User',
        email: 'test@example.com',
        date: '2025-01-01',
        groupSize: 0, // invalid because the group size is below the minimum allowed value
        timeSlot: '09:00 AM - 10:00 AM',
        deposit: 50,
      };

      // Simulate the service throwing the error due to invalid input.
      mockBookingService.createBooking.mockRejectedValue(new BadRequestException('Group size must be at least 1'));

      await expect(controller.createBooking(invalidBookingDto)).rejects.toThrow(BadRequestException);
      expect(mockBookingService.createBooking).toHaveBeenCalledWith(invalidBookingDto);
    });
  });

  describe('getAllBookings', () => {
    it('should return a list of all bookings', async () => {
      const bookings: Booking[] = [
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

      mockBookingService.getAllBookings.mockResolvedValue(bookings);
      const result = await controller.getAllBookings();
      expect(result).toEqual(bookings);
      expect(mockBookingService.getAllBookings).toHaveBeenCalled();
    });
  });

  describe('getBookingById', () => {
    it('should return a booking when found', async () => {
      const booking: Booking = {
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
      };

      mockBookingService.getBookingById.mockResolvedValue(booking);
      const result = await controller.getBookingById(1);
      expect(result).toEqual(booking);
      expect(mockBookingService.getBookingById).toHaveBeenCalledWith(1);
    });

    it('should throw a NotFoundException when booking is not found', async () => {
      mockBookingService.getBookingById.mockRejectedValue(new NotFoundException('Booking not found'));
      await expect(controller.getBookingById(999)).rejects.toThrow(NotFoundException);
      expect(mockBookingService.getBookingById).toHaveBeenCalledWith(999);
    });
  });
});
