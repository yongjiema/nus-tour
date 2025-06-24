import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { TokenBlacklistService } from "./token-blacklist.service";
import { JwtService } from "@nestjs/jwt";
import { TEST_USER_ID_1, TEST_USER_ROLE_ID } from "../common/testing";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Request } from "express";
import { User } from "../database/entities/user.entity";
import { AuthenticatedRequest } from "../common/types/request.types";
import { UserResponseDto } from "./dto/user-response.dto";
import { Role } from "../database/entities/role.entity";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;
  let _tokenBlacklistService: TokenBlacklistService; // Prefixed with _ to indicate intentionally unused

  const mockUser: Partial<User> = {
    id: TEST_USER_ID_1,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    emailVerified: false,
    isActive: true,
    createdAt: new Date(),
    modifiedAt: new Date(),
    roles: [{ id: TEST_USER_ROLE_ID, name: "USER" } as Role],
  };

  const mockUserResponse: UserResponseDto = {
    id: TEST_USER_ID_1,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    roles: ["USER"],
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  };

  const mockTokenBlacklistService = {
    addToBlacklist: jest.fn(),
    isBlacklisted: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
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
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    _tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        password: "password123",
      };

      const expectedResult = {
        access_token: "mock-token",
        user: mockUserResponse,
      };
      const registerSpy = jest.spyOn(authService, "register").mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(registerSpy).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });

    it("should throw ConflictException when user already exists", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        password: "password123",
      };

      const registerSpy = jest
        .spyOn(authService, "register")
        .mockRejectedValue(new ConflictException("User already exists"));

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      expect(registerSpy).toHaveBeenCalledWith(registerDto);
    });
  });

  describe("login", () => {
    it("should login user and return access token", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const expectedResult = {
        access_token: "mock-token",
        user: mockUserResponse,
      };
      const loginSpy = jest.spyOn(authService, "login").mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(loginSpy).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const loginSpy = jest
        .spyOn(authService, "login")
        .mockRejectedValue(new UnauthorizedException("Invalid credentials"));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(loginSpy).toHaveBeenCalledWith(loginDto);
    });
  });

  describe("getProfile", () => {
    it("should return user profile", () => {
      const mockAuthRequest = {
        user: mockUser,
      } as unknown as AuthenticatedRequest;

      const result = controller.getProfile(mockAuthRequest);

      expect(result).toEqual(mockUser);
    });
  });

  describe("logout", () => {
    it("should logout user successfully", () => {
      const mockRequest = {
        headers: {
          authorization: "Bearer mock-token",
        },
      } as Request;

      const logoutSpy = jest.spyOn(authService, "logout").mockReturnValue(undefined);

      const result = controller.logout(mockRequest);

      expect(logoutSpy).toHaveBeenCalledWith("mock-token");
      expect(result).toEqual({ message: "Logged out successfully" });
    });

    it("should throw UnauthorizedException when no authorization header", () => {
      const mockRequest = {
        headers: {},
      } as Request;

      expect(() => controller.logout(mockRequest)).toThrow(UnauthorizedException);
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const mockRequest = {
        headers: {
          authorization: "Bearer old-token",
        },
      } as Request;

      const expectedResult = {
        access_token: "new-token",
        user: mockUserResponse,
      };
      const refreshSpy = jest.spyOn(authService, "refreshToken").mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(mockRequest);

      expect(refreshSpy).toHaveBeenCalledWith("old-token");
      expect(result).toEqual(expectedResult);
    });
  });
});
