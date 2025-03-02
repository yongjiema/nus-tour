import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;
  let tokenBlacklistService: TokenBlacklistService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            register: jest.fn(),
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            addToBlacklist: jest.fn(),
            isBlacklisted: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);

    // Mock bcrypt.compare function
    jest.spyOn(bcrypt, 'compare').mockImplementation((password) => {
      return Promise.resolve(password === 'correctPassword');
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        username: 'Test User',
        password: 'password',
      };
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.register.mockResolvedValue({ id: 1, email: 'test@example.com', username: 'Test User' });

      const result = await service.register(registerDto);

      expect(result).toEqual({ token: 'mocked-token' });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUsersService.register).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com', username: 'Test User' }),
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: 1, email: 'test@example.com' }, expect.any(Object));
    });

    it('should throw ConflictException if email is already in use', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        username: 'Test User',
        password: 'password',
      };
      mockUsersService.findByEmail.mockResolvedValue({ email: 'test@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('login', () => {
    it('should return a JWT token when login is successful', async () => {
      // Arrange
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      // Act
      const result = await service.login({
        email: 'test@example.com',
        password: 'correctPassword',
      });

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(jwtService.sign).toHaveBeenCalled();
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'anyPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should add token to blacklist when logout is called', async () => {
      // Act
      await service.logout('test-token');

      // Assert
      expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalledWith('test-token');
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException when token is blacklisted', async () => {
      // Arrange
      jest.spyOn(tokenBlacklistService, 'isBlacklisted').mockReturnValue(true);

      // Act & Assert
      await expect(service.refreshToken('blacklisted-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should return a new token when refresh is successful', async () => {
      // Arrange
      jest.spyOn(tokenBlacklistService, 'isBlacklisted').mockReturnValue(false);
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: 1 });
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      // Act
      const result = await service.refreshToken('valid-token');

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });
});
