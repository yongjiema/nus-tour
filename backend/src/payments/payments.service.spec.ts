import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from '../database/entities/payments.entity';
import { User } from '../database/entities/user.entity';
import { Booking } from '../database/entities/booking.entity';
import { BookingService } from '../booking/booking.service';
import { Repository } from 'typeorm';
import { Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentStatus, BookingStatus } from '../database/entities/enums';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any>;
};

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepository: MockRepository<Payment>;
  let userRepository: MockRepository<User>;
  let bookingRepository: MockRepository<Booking>;
  let bookingService: MockType<BookingService>;

  // Sample test data
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  };

  const mockBooking = {
    id: 123,
    bookingId: 'booking-123',
    name: 'Test Booking',
    email: 'test@example.com',
    deposit: 50,
    bookingStatus: BookingStatus.PENDING,
  };

  const mockPayment = {
    id: 1,
    bookingId: mockBooking.id,
    amount: 50,
    status: PaymentStatus.PENDING,
    transactionId: 'tx-123',
    paymentMethod: 'credit_card',
    createdAt: new Date(),
    updatedAt: new Date(),
    booking: mockBooking,
  };

  beforeEach(async () => {
    // Create mock repositories
    const paymentsRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const userRepositoryMock = {
      findOne: jest.fn(),
    };

    const bookingRepositoryMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };

    // Create mock booking service with proper typings
    const bookingServiceMock = {
      getBookingByBookingId: jest.fn().mockImplementation(jest.fn()),
      getBookingById: jest.fn().mockImplementation(jest.fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: paymentsRepositoryMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: bookingRepositoryMock,
        },
        {
          provide: BookingService,
          useValue: bookingServiceMock,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentsRepository = module.get(getRepositoryToken(Payment));
    userRepository = module.get(getRepositoryToken(User));
    bookingRepository = module.get(getRepositoryToken(Booking));
    bookingService = module.get(BookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const createPaymentDto: CreatePaymentDto = {
        bookingId: 'booking-123',
        amount: 100,
      };
      const user = { id: 'user-1', email: 'test@example.com' };

      // Mock booking service to return a booking
      jest.spyOn(bookingService, 'getBookingByBookingId').mockResolvedValueOnce(mockBooking as any);

      // Mock no existing payment
      paymentsRepository.findOne.mockResolvedValue(null);

      // Mock payment creation
      paymentsRepository.create.mockReturnValue({
        ...mockPayment,
        amount: createPaymentDto.amount,
      });

      // Mock save operation
      paymentsRepository.save.mockResolvedValue({
        ...mockPayment,
        amount: createPaymentDto.amount,
      });

      const result = await service.createPayment(createPaymentDto, user);

      expect(bookingService.getBookingByBookingId).toHaveBeenCalledWith('booking-123');
      expect(paymentsRepository.findOne).toHaveBeenCalled();
      expect(paymentsRepository.create).toHaveBeenCalled();
      expect(paymentsRepository.save).toHaveBeenCalled();
      expect(result).toMatchObject({
        bookingId: mockBooking.id,
        amount: 100,
      });
    });

    it('should throw NotFoundException when booking is not found', async () => {
      const createPaymentDto = {
        bookingId: 'non-existent',
      };
      const user = { id: 'user-1', email: 'test@example.com' };

      // Mock booking service to throw NotFoundException
      jest
        .spyOn(bookingService, 'getBookingByBookingId')
        .mockRejectedValueOnce(new NotFoundException(`Booking with booking ID non-existent not found`));

      await expect(service.createPayment(createPaymentDto, user)).rejects.toThrow(NotFoundException);
      expect(bookingService.getBookingByBookingId).toHaveBeenCalledWith('non-existent');
    });

    it('should throw ForbiddenException when user is not authorized', async () => {
      const createPaymentDto = {
        bookingId: 'booking-123',
      };
      const user = { id: 'user-2', email: 'different@example.com' };

      // Mock booking service to return a booking with different email
      jest.spyOn(bookingService, 'getBookingByBookingId').mockResolvedValueOnce(mockBooking as any);

      await expect(service.createPayment(createPaymentDto, user)).rejects.toThrow(ForbiddenException);
      expect(bookingService.getBookingByBookingId).toHaveBeenCalledWith('booking-123');
    });

    it('should update existing payment when one exists', async () => {
      const createPaymentDto = {
        bookingId: 'booking-123',
        status: PaymentStatus.COMPLETED,
      };
      const user = { id: 'user-1', email: 'test@example.com' };

      // Mock booking service to return a booking
      jest.spyOn(bookingService, 'getBookingByBookingId').mockResolvedValueOnce(mockBooking as any);

      // Mock existing payment
      paymentsRepository.findOne.mockResolvedValue(mockPayment);

      // Mock updated payment
      paymentsRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      });

      // Mock finding booking directly
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.createPayment(createPaymentDto, user);

      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(paymentsRepository.save).toHaveBeenCalled();
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status by numeric ID', async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: 123,
        status: PaymentStatus.COMPLETED,
      };

      // Mock finding booking by ID
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      // Mock existing payment
      paymentsRepository.findOne.mockResolvedValue(mockPayment);

      // Mock updated payment
      paymentsRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      });

      // Mock updated booking
      bookingRepository.save.mockResolvedValue({
        ...mockBooking,
        bookingStatus: BookingStatus.CONFIRMED,
      });

      const result = await service.updatePaymentStatus(updateDto);

      expect(bookingRepository.findOne).toHaveBeenCalled();
      expect(paymentsRepository.findOne).toHaveBeenCalled();
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should update payment status by string ID', async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: 'booking-123',
        status: PaymentStatus.COMPLETED,
      };

      // Mock getting booking by bookingId
      jest.spyOn(bookingService, 'getBookingByBookingId').mockResolvedValueOnce(mockBooking as any);

      // Mock existing payment
      paymentsRepository.findOne.mockResolvedValue(mockPayment);

      // Mock updated payment
      paymentsRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      });

      // Mock updated booking
      bookingRepository.save.mockResolvedValue({
        ...mockBooking,
        bookingStatus: BookingStatus.CONFIRMED,
      });

      const result = await service.updatePaymentStatus(updateDto);

      expect(bookingService.getBookingByBookingId).toHaveBeenCalledWith('booking-123');
      expect(paymentsRepository.findOne).toHaveBeenCalled();
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should create a new payment if none exists', async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: 123,
        status: PaymentStatus.COMPLETED,
      };

      // Mock finding booking by ID
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      // Mock no existing payment
      paymentsRepository.findOne.mockResolvedValue(null);

      // Mock payment creation
      paymentsRepository.create.mockReturnValue({
        bookingId: mockBooking.id,
        amount: mockBooking.deposit,
        status: PaymentStatus.PENDING,
      });

      // Mock updated payment
      paymentsRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      });

      const result = await service.updatePaymentStatus(updateDto);

      expect(paymentsRepository.create).toHaveBeenCalled();
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should throw NotFoundException when booking is not found', async () => {
      const updateDto: UpdatePaymentStatusDto = {
        bookingId: 999,
        status: PaymentStatus.COMPLETED,
      };

      // Mock not finding booking
      bookingRepository.findOne.mockResolvedValue(null);
      jest
        .spyOn(bookingService, 'getBookingByBookingId')
        .mockRejectedValueOnce(new NotFoundException('Booking not found'));

      await expect(service.updatePaymentStatus(updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPaymentsByUserId', () => {
    it('should return payments for a user', async () => {
      const userId = 'user-1';

      // Mock finding user
      userRepository.findOne.mockResolvedValue(mockUser);

      // Mock finding bookings
      bookingRepository.find.mockResolvedValue([mockBooking]);

      // Mock finding payments
      paymentsRepository.find.mockResolvedValue([mockPayment]);

      const result = await service.getPaymentsByUserId(userId);

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(bookingRepository.find).toHaveBeenCalled();
      expect(paymentsRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockPayment]);
    });

    it('should return empty array when user is not found', async () => {
      const userId = 'non-existent';

      // Mock not finding user
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.getPaymentsByUserId(userId);

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return empty array when user has no bookings', async () => {
      const userId = 'user-1';

      // Mock finding user
      userRepository.findOne.mockResolvedValue(mockUser);

      // Mock finding no bookings
      bookingRepository.find.mockResolvedValue([]);

      const result = await service.getPaymentsByUserId(userId);

      expect(bookingRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getPaymentByBookingId', () => {
    it('should return payment for a valid booking ID', async () => {
      const bookingId = 123;

      // Mock finding booking
      jest.spyOn(bookingService, 'getBookingById').mockResolvedValueOnce(mockBooking as any);

      // Mock finding payment
      paymentsRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.getPaymentByBookingId(bookingId);

      expect(bookingService.getBookingById).toHaveBeenCalledWith(bookingId);
      expect(paymentsRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('should try UUID lookup if numeric ID fails', async () => {
      const bookingId = 123;

      // Mock failing to find booking by numeric ID
      jest.spyOn(bookingService, 'getBookingById').mockRejectedValueOnce(new NotFoundException('Not found'));

      // Mock finding booking by string ID
      jest.spyOn(bookingService, 'getBookingByBookingId').mockResolvedValueOnce(mockBooking as any);

      // Mock finding payment
      paymentsRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.getPaymentByBookingId(bookingId);

      expect(bookingService.getBookingById).toHaveBeenCalledWith(bookingId);
      expect(bookingService.getBookingByBookingId).toHaveBeenCalledWith('123');
      expect(paymentsRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException when booking is not found', async () => {
      const bookingId = 999;

      // Mock failing to find booking by any method
      jest.spyOn(bookingService, 'getBookingById').mockRejectedValueOnce(new NotFoundException('Not found'));
      jest.spyOn(bookingService, 'getBookingByBookingId').mockRejectedValueOnce(new NotFoundException('Not found'));

      await expect(service.getPaymentByBookingId(bookingId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when payment is not found', async () => {
      const bookingId = 123;

      // Mock finding booking
      jest.spyOn(bookingService, 'getBookingById').mockResolvedValueOnce(mockBooking as any);

      // Mock not finding payment
      paymentsRepository.findOne.mockResolvedValue(null);

      await expect(service.getPaymentByBookingId(bookingId)).rejects.toThrow(NotFoundException);
    });
  });
});
