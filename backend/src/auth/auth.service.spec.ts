import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { User } from "../database/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { TokenBlacklistService } from "./token-blacklist.service";

jest.mock("bcrypt", () => ({
  compare: jest.fn().mockImplementation((plaintext) => Promise.resolve(plaintext === "correctPassword")),
}));

describe("AuthService", () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;
  let tokenBlacklistService: TokenBlacklistService;
  let mockUser: Partial<User>;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("test-token"),
    verify: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
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
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);

    jest.clearAllMocks();

    mockUser = {
      id: "1",
      email: "test@example.com",
      username: "Test User",
      role: "user",
      comparePassword: jest.fn(),
    };
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user and return a token", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        username: "Test User",
        password: "password",
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.register.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("mocked-token");

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: "mocked-token",
        user: mockUser,
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(usersService.register).toHaveBeenCalledWith(registerDto);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          id: "1",
          email: "test@example.com",
          username: "Test User",
        },
        { expiresIn: "60m" },
      );
    });

    it("should throw ConflictException if email is already in use", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        username: "Test User",
        password: "password",
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should return access token and user when login is successful", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "correctPassword",
      };

      mockUsersService.validateUser.mockResolvedValue(mockUser);
      // Ensure JWT mock returns 'test-token'
      mockJwtService.sign.mockReturnValue("test-token");

      const result = await service.login(loginDto);

      expect(usersService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          id: "1",
          username: "Test User",
          role: "user",
        },
        { expiresIn: "60m" },
      );
      expect(result).toEqual({
        access_token: "test-token",
        user: {
          id: "1",
          email: "test@example.com",
          username: "Test User",
          role: "user",
        },
      });
    });

    it("should throw UnauthorizedException when user is not found", async () => {
      const loginDto: LoginDto = {
        email: "nonexistent@example.com",
        password: "anyPassword",
      };
      mockUsersService.validateUser.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should add token to blacklist", async () => {
      await service.logout("test-token");
      expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalledWith("test-token");
    });
  });

  describe("refreshToken", () => {
    it("should throw UnauthorizedException if token is blacklisted", async () => {
      mockTokenBlacklistService.isBlacklisted.mockReturnValue(true);

      await expect(service.refreshToken("blacklisted-token")).rejects.toThrow(UnauthorizedException);
    });

    it("should return new token when refresh is successful", async () => {
      mockTokenBlacklistService.isBlacklisted.mockReturnValue(false);
      mockJwtService.verify.mockReturnValue({ id: "1" });
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("new-token");

      const result = await service.refreshToken("valid-token");

      expect(result).toEqual({ access_token: "new-token" });
      expect(mockUsersService.findById).toHaveBeenCalledWith("1");
    });
  });
});
