import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { TokenBlacklistService } from "./token-blacklist.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  // Create a successful mock user response
  const mockUser = {
    id: "1",
    email: "test@example.com",
    username: "Test User",
    role: "user",
  };

  // Mock the auth service
  const mockAuthService = {
    register: jest.fn().mockImplementation((dto) => {
      // Simulate conflict for existing email
      if (dto.email === "existing@example.com") {
        throw new ConflictException("Email already in use");
      }

      // Return successful registration for other emails
      return Promise.resolve({
        access_token: "test-token",
        user: mockUser,
      });
    }),
    login: jest.fn().mockImplementation((dto) => {
      // Successful login
      return Promise.resolve({
        access_token: "test-token",
        user: mockUser,
      });
    }),
    refreshToken: jest.fn().mockResolvedValue({
      access_token: "new-token",
    }),
    logout: jest.fn().mockResolvedValue({ success: true }),
  };

  // Mock users service
  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  // Mock JWT service
  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  // Mock token blacklist service
  const mockTokenBlacklistService = {
    addToBlacklist: jest.fn(),
    isBlacklisted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
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
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const registerDto = {
        email: "test@example.com",
        username: "Test User",
        password: "Password123!",
      };

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        access_token: "test-token",
        user: mockUser,
      });
    });

    it("should handle existing email conflict", async () => {
      const registerDto = {
        email: "existing@example.com",
        username: "Test User",
        password: "Password123!",
      };

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe("login", () => {
    it("should login a user", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "Password123!",
      };

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        access_token: "test-token",
        user: mockUser,
      });
    });
  });

  describe("refreshToken", () => {
    it("should refresh token", async () => {
      const request = {
        headers: {
          authorization: "Bearer old-token",
        },
      };

      const result = await controller.refreshToken(request);

      expect(authService.refreshToken).toHaveBeenCalledWith("old-token");
      expect(result).toEqual({
        access_token: "new-token",
      });
    });

    it("should handle missing token", async () => {
      const request = {
        headers: {},
      };

      await expect(controller.refreshToken(request)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should logout a user", async () => {
      const request = {
        headers: {
          authorization: "Bearer test-token",
        },
      };

      const result = await controller.logout(request);

      expect(authService.logout).toHaveBeenCalledWith("test-token");
      expect(result).toEqual({ message: "Logged out successfully" });
    });

    it("should handle missing token", async () => {
      const request = {
        headers: {},
      };

      await expect(controller.logout(request)).rejects.toThrow(UnauthorizedException);
    });
  });
});
