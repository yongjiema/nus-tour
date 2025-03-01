import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenBlacklistService } from './token-blacklist.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn(() => 'mocked-token'),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    register: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockTokenBlacklistService = {
    addToBlacklist: jest.fn(),
    isBlacklisted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: TokenBlacklistService, useValue: mockTokenBlacklistService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
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
    it('should login a user and return an access token', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const user = { id: 1, email: 'test@example.com', username: 'Test User' };
      mockUsersService.validateUser.mockResolvedValue(user);

      const result = await service.login(loginDto);
      expect(result).toEqual({ access_token: 'mocked-token' });
      expect(mockUsersService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ email: user.email, id: user.id }, expect.any(Object));
    });

    it('should throw UnauthorizedException if validation fails during login', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };
      mockUsersService.validateUser.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.validateUser).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout and token blacklisting', () => {
    it('should add a token to the blacklist on logout', async () => {
      const token = 'test-token';
      await service.logout(token);
      service.isTokenBlacklisted(token);
      expect(mockTokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(token);
      expect(mockTokenBlacklistService.isBlacklisted).toHaveBeenCalledWith(token);
    });
  });
});
