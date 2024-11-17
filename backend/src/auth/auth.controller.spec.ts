import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
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

  describe('register', () => {
    it('should register a user and return a token', async () => {
      const mockRegisterDto: RegisterDto = { email: 'test@example.com', username: 'Test User', password: 'password' };
      const mockToken = { token: 'mocked-token' };
      mockAuthService.register.mockResolvedValue(mockToken);

      const result = await authController.register(mockRegisterDto);
      expect(result).toEqual(mockToken);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should throw a BadRequestException if registration fails', async () => {
      const mockRegisterDto: RegisterDto = { email: 'test@example.com', username: 'Test User', password: 'password' };
      mockAuthService.register.mockRejectedValue(new BadRequestException('Registration failed.'));

      await expect(authController.register(mockRegisterDto)).rejects.toThrow(BadRequestException);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });
  });
});
