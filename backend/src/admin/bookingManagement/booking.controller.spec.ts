import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingStatus } from '../../database/entities/enums';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from '../../auth/token-blacklist.service';
import { NotFoundException } from '@nestjs/common';

// Create a mock for JwtAuthGuard that always allows access
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

describe('BookingController', () => {
  let controller: BookingController;
  let service: BookingService;

  // Sample booking data for testing
  const sampleBooking = {
    bookingId: 'test-id',
    name: 'Test User',
    date: '2023-06-01',
    bookingStatus: BookingStatus.CONFIRMED,
  };

  // Mock service with more detailed implementations
  const mockBookingService = {
    findAll: jest.fn().mockResolvedValue([sampleBooking]),
    getFilteredBookings: jest.fn().mockImplementation((search, status, date) => {
      // This mock implementation simulates filtering logic
      const bookings = [sampleBooking];
      if (status && status !== BookingStatus.CONFIRMED) {
        return Promise.resolve([]);
      }
      if (date && date !== sampleBooking.date) {
        return Promise.resolve([]);
      }
      if (search && !sampleBooking.name.includes(search)) {
        return Promise.resolve([]);
      }
      return Promise.resolve(bookings);
    }),
    updateBookingStatus: jest.fn().mockImplementation((id, status) => {
      if (id === 'non-existent-id') {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }
      return Promise.resolve({
        ...sampleBooking,
        bookingId: id,
        bookingStatus: status,
      });
    }),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockTokenBlacklistService = {
    isBlacklisted: jest.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    jest.clearAllMocks(); // Reset mocks between tests

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
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(BookingService);
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should get all bookings', async () => {
      const result = await controller.findAll({ user: { id: 'admin-id' } });
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([sampleBooking]);
    });

    it('should log the user making the request', async () => {
      // Create a spy on console.log
      const consoleSpy = jest.spyOn(console, 'log');
      await controller.findAll({ user: { id: 'admin-id' } });
      expect(consoleSpy).toHaveBeenCalledWith('User making request:', { id: 'admin-id' });
      consoleSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      // Override the mock for this specific test
      service.findAll = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(controller.findAll({ user: { id: 'admin-id' } })).rejects.toThrow('Database error');
    });
  });

  describe('getBookings', () => {
    it('should get filtered bookings with search term', async () => {
      const result = await controller.getBookings('Test User', null, null);
      expect(service.getFilteredBookings).toHaveBeenCalledWith('Test User', null, null);
      expect(result).toEqual([sampleBooking]);
    });

    it('should get filtered bookings with status', async () => {
      const result = await controller.getBookings(null, 'confirmed', null);
      expect(service.getFilteredBookings).toHaveBeenCalledWith(null, 'confirmed', null);
      expect(result).toEqual([sampleBooking]);
    });

    it('should get filtered bookings with date', async () => {
      const result = await controller.getBookings(null, null, '2023-06-01');
      expect(service.getFilteredBookings).toHaveBeenCalledWith(null, null, '2023-06-01');
      expect(result).toEqual([sampleBooking]);
    });

    it('should return empty array when no bookings match filters', async () => {
      const result = await controller.getBookings(null, 'cancelled', null);
      expect(service.getFilteredBookings).toHaveBeenCalledWith(null, 'cancelled', null);
      expect(result).toEqual([]);
    });

    it('should get filtered bookings with multiple criteria', async () => {
      const result = await controller.getBookings('Test User', 'confirmed', '2023-06-01');
      expect(service.getFilteredBookings).toHaveBeenCalledWith('Test User', 'confirmed', '2023-06-01');
      expect(result).toEqual([sampleBooking]);
    });

    it('should handle service errors', async () => {
      // Override the mock for this specific test
      service.getFilteredBookings = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(controller.getBookings('Test', 'confirmed', '2023-06-01')).rejects.toThrow('Database error');
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status', async () => {
      const result = await controller.updateBookingStatus('booking-id', 'confirmed');
      expect(service.updateBookingStatus).toHaveBeenCalledWith('booking-id', BookingStatus.CONFIRMED);
      expect(result).toEqual({
        ...sampleBooking,
        bookingId: 'booking-id',
        bookingStatus: BookingStatus.CONFIRMED,
      });
    });

    it('should handle non-existent booking ID', async () => {
      await expect(controller.updateBookingStatus('non-existent-id', 'confirmed')).rejects.toThrow(NotFoundException);
      expect(service.updateBookingStatus).toHaveBeenCalledWith('non-existent-id', BookingStatus.CONFIRMED);
    });

    it('should handle status change to cancelled', async () => {
      const result = await controller.updateBookingStatus('booking-id', 'cancelled');
      expect(service.updateBookingStatus).toHaveBeenCalledWith('booking-id', BookingStatus.CANCELLED);
      expect(result.bookingStatus).toBe(BookingStatus.CANCELLED);
    });

    it('should handle status change to completed', async () => {
      const result = await controller.updateBookingStatus('booking-id', 'completed');
      expect(service.updateBookingStatus).toHaveBeenCalledWith('booking-id', BookingStatus.COMPLETED);
      expect(result.bookingStatus).toBe(BookingStatus.COMPLETED);
    });

    it('should handle invalid status values', async () => {
      await controller.updateBookingStatus('booking-id', 'invalid-status');
      expect(service.updateBookingStatus).toHaveBeenCalledWith('booking-id', 'invalid-status');
      // The controller passes the value to the service, which should handle validation
    });

    it('should handle service errors', async () => {
      // Override the mock for this specific test
      service.updateBookingStatus = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      await expect(controller.updateBookingStatus('booking-id', 'confirmed')).rejects.toThrow('Database error');
    });
  });
});
