import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { TokenBlacklistService } from "./token-blacklist.service";
import { User } from "../database/entities/user.entity";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let tokenBlacklistService: TokenBlacklistService;

  const mockUser: Partial<User> = {
    id: "1",
    email: "test@example.com",
    username: "testuser",
    password: "hashedpassword",
    role: "user",
    unhashedPassword: "plainpassword",
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
    register: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => "mock-token"),
    verify: jest.fn(),
  };

  const mockTokenBlacklistService = {
    addToBlacklist: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "JWT_SECRET") return "test-secret";
      if (key === "JWT_EXPIRATION") return "1h";
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: TokenBlacklistService, useValue: mockTokenBlacklistService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should return user when credentials are valid", async () => {
      const findByEmailSpy = jest.spyOn(usersService, "findByEmail").mockResolvedValue(mockUser as User);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser("test@example.com", "password");

      expect(result).toEqual(mockUser);
      expect(findByEmailSpy).toHaveBeenCalledWith("test@example.com");
    });

    it("should return null when user not found", async () => {
      const findByEmailSpy = jest.spyOn(usersService, "findByEmail").mockResolvedValue(null);

      const result = await service.validateUser("test@example.com", "password");

      expect(result).toBeNull();
      expect(findByEmailSpy).toHaveBeenCalledWith("test@example.com");
    });

    it("should return null when password is invalid", async () => {
      const findByEmailSpy = jest.spyOn(usersService, "findByEmail").mockResolvedValue(mockUser as User);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser("test@example.com", "wrongpassword");

      expect(result).toBeNull();
      expect(findByEmailSpy).toHaveBeenCalledWith("test@example.com");
    });
  });

  describe("login", () => {
    it("should return access token when login is successful", async () => {
      const loginDto = { email: "test@example.com", password: "password" };

      const validateUserSpy = jest.spyOn(service, "validateUser").mockResolvedValue(mockUser as User);
      const jwtSignSpy = jest.spyOn(jwtService, "sign");

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("access_token");
      expect(validateUserSpy).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(jwtSignSpy).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when credentials are invalid", async () => {
      const loginDto = { email: "test@example.com", password: "wrongpassword" };

      const validateUserSpy = jest.spyOn(service, "validateUser").mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(validateUserSpy).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      const registerDto = {
        email: "test@example.com",
        username: "testuser",
        password: "password",
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

      const registerSpy = jest.spyOn(usersService, "register").mockResolvedValue({
        ...mockUser,
        password: "hashed-password",
      } as User);
      const jwtSignSpy = jest.spyOn(jwtService, "sign");

      const result = await service.register(registerDto);

      expect(registerSpy).toHaveBeenCalledWith({
        email: registerDto.email,
        username: registerDto.username,
        password: "hashed-password",
      });
      expect(result).toHaveProperty("access_token");
      expect(jwtSignSpy).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should add token to blacklist", () => {
      const token = "mock-token";
      const addToBlacklistSpy = jest.spyOn(tokenBlacklistService, "addToBlacklist");

      service.logout(token);

      expect(addToBlacklistSpy).toHaveBeenCalledWith(token);
    });
  });

  describe("refreshToken", () => {
    it("should return new token when current token is valid", async () => {
      const token = "valid-token";
      const decodedPayload = { sub: "1", email: "test@example.com" };

      const jwtVerifySpy = jest.spyOn(jwtService, "verify").mockReturnValue(decodedPayload);
      const findByIdSpy = jest.spyOn(usersService, "findById").mockResolvedValue(mockUser as User);
      const jwtSignSpy = jest.spyOn(jwtService, "sign");

      const result = await service.refreshToken(token);

      expect(result).toHaveProperty("access_token");
      expect(jwtVerifySpy).toHaveBeenCalledWith(token);
      expect(findByIdSpy).toHaveBeenCalledWith(decodedPayload.sub);
      expect(jwtSignSpy).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when token is invalid", async () => {
      const token = "invalid-token";

      const jwtVerifySpy = jest.spyOn(jwtService, "verify").mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(service.refreshToken(token)).rejects.toThrow(UnauthorizedException);
      expect(jwtVerifySpy).toHaveBeenCalledWith(token);
    });
  });
});
