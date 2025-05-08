import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { User } from "../database/entities/user.entity";
import { ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

// Mock bcrypt for tests
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockImplementation((plaintext, hash) => Promise.resolve(plaintext === "correctPassword")),
}));

describe("UsersService", () => {
  let service: UsersService;
  let mockUserRepository;

  // Sample user data
  const mockUser = {
    id: "1",
    email: "test@example.com",
    username: "Test User",
    password: "hashed_password",
    role: "user",
    comparePassword: jest.fn().mockResolvedValue(true),
  };

  // Create mock repository
  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findByEmail", () => {
    it("should return a user if found", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail("test@example.com");
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should return null if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail("nonexistent@example.com");
      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return a user if found", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById("1");
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById("999")).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "999" },
      });
    });
  });

  describe("register", () => {
    it("should create a new user", async () => {
      const registerDto = {
        email: "new@example.com",
        username: "New User",
        password: "password123",
      };

      jest.clearAllMocks();
      const hashMock = jest.requireMock("bcrypt").hash;
      hashMock.mockImplementation(() => Promise.resolve("hashed_password"));
      // Mock findOne to return null (user doesn't exist)
      mockUserRepository.findOne.mockResolvedValue(null);

      // Mock create to return a new user
      mockUserRepository.create.mockReturnValue({
        ...registerDto,
        id: "2",
        password: "hashed_password",
        role: "user",
      });

      // Mock save to return the created user
      mockUserRepository.save.mockResolvedValue({
        id: "2",
        email: registerDto.email,
        username: registerDto.username,
        role: "user",
      });

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();

      expect(result).toEqual({
        id: "2",
        email: registerDto.email,
        username: registerDto.username,
        role: "user",
      });
    });

    // For the database error test:
    it("should throw Error for database errors", async () => {
      const registerDto = {
        email: "new@example.com",
        username: "New User",
        password: "password123",
      };

      // Mock findOne to return null (user doesn't exist)
      mockUserRepository.findOne.mockResolvedValue(null);

      // Mock create to return a new user
      mockUserRepository.create.mockReturnValue({
        ...registerDto,
        id: "2",
        password: "hashed_password",
        role: "user",
      });

      // Mock save to throw an error
      mockUserRepository.save.mockRejectedValue(new Error("Database error"));

      // Adjust this test according to how your service actually handles DB errors
      // If it re-throws the original error:
      await expect(service.register(registerDto)).rejects.toThrow("Database error");

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe("validateUser", () => {
    it("should return user if credentials are valid", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "correctPassword",
      };

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(true),
      });

      const result = await service.validateUser(loginDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it("should throw NotFoundException if user not found", async () => {
      const loginDto = {
        email: "nonexistent@example.com",
        password: "any-password",
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(loginDto)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it("should throw NotFoundException if password is incorrect", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "wrongPassword",
      };

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(false),
      });

      await expect(service.validateUser(loginDto)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });
  });
});
