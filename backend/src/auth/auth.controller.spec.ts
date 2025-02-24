import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
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
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user and return a token', async () => {
      const mockRegisterDto: RegisterDto = {
        email: 'test@example.com',
        username: 'Test User',
        password: 'password',
      };
      const mockToken = { token: 'mocked-token' };
      mockAuthService.register.mockResolvedValue(mockToken);

      const result = await authController.register(mockRegisterDto);
      expect(result).toEqual(mockToken);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should throw a ConflictException if email is already in use', async () => {
      const mockRegisterDto: RegisterDto = {
        email: 'test@example.com',
        username: 'Test User',
        password: 'password',
      };
      mockAuthService.register.mockRejectedValue(new ConflictException('Email is already in use'));

      await expect(authController.register(mockRegisterDto)).rejects.toThrow(ConflictException);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should throw a BadRequestException for a general registration failure', async () => {
      const mockRegisterDto: RegisterDto = {
        email: 'test@example.com',
        username: 'Test User',
        password: 'password',
      };
      mockAuthService.register.mockRejectedValue(new BadRequestException('Registration failed.'));

      await expect(authController.register(mockRegisterDto)).rejects.toThrow(BadRequestException);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });
  });

  describe('login', () => {
    it('should login a user and return an access token', async () => {
      const mockLoginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const mockAccessToken = { access_token: 'mocked-access-token' };
      mockAuthService.login.mockResolvedValue(mockAccessToken);

      const result = await authController.login(mockLoginDto);
      expect(result).toEqual({ access_token: mockAccessToken.access_token });
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('should throw an UnauthorizedException if login fails', async () => {
      const mockLoginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Login failed'));

      await expect(authController.login(mockLoginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginDto);
    });
  });

  describe('logout', () => {
    it('should logout a user and return a success message', async () => {
      // For endpoints that require auth, we assume JwtAuthGuard returns true.
      const mockReq = { headers: { authorization: 'Bearer valid-token' } } as any;
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await authController.logout(mockReq);
      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockAuthService.logout).toHaveBeenCalledWith('valid-token');
    });

    it('should throw an UnauthorizedException if no token is provided on logout', async () => {
      const mockReq = { headers: {} } as any;
      await expect(authController.logout(mockReq)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile attached to the request', async () => {
      const mockReq = { user: { id: 1, email: 'test@example.com', username: 'Test User' } } as any;
      const result = authController.getProfile(mockReq);
      expect(result).toEqual(mockReq.user);
    });
  });
});
