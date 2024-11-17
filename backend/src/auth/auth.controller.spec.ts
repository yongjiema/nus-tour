import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return a success message', async () => {
      const mockRegisterDto: RegisterDto = { email: 'test@example.com', name: 'Test User', password: 'password' };
      mockAuthService.register.mockResolvedValue(undefined);

      const result = await authController.register(mockRegisterDto);
      expect(result).toEqual({ message: 'Registration successful. You can now log in.' });
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should throw a BadRequestException if registration fails', async () => {
      const mockRegisterDto: RegisterDto = { email: 'test@example.com', name: 'Test User', password: 'password' };
      mockAuthService.register.mockRejectedValue(new Error('Registration failed.'));

      await expect(authController.register(mockRegisterDto)).rejects.toThrow(BadRequestException);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });
  });

  describe('login', () => {
    it('should log in a user and return access tokens', async () => {
      const mockLoginDto = { email: 'test@example.com', password: 'password123' };
      const mockTokens = { accessToken: 'access-token' };
      mockAuthService.login.mockResolvedValue(mockTokens);

      const result = await authController.login(mockLoginDto);
      expect(result).toEqual(mockTokens);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('should throw an UnauthorizedException if login fails', async () => {
      const mockLoginDto = { email: 'test@example.com', password: 'wrongpassword' };
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials.'));

      await expect(authController.login(mockLoginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginDto);
    });
  });
});
