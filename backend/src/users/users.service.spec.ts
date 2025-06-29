import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UsersService } from "./users.service";
import { User } from "../database/entities/user.entity";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { TEST_NON_EXISTENT_BOOKING_ID, TEST_USER_ID_1, TEST_USER_ID_2, TEST_USER_ROLE_ID } from "../common/testing";
import { ObjectLiteral } from "typeorm";
import { Role } from "../database/entities/role.entity";

// Mock bcrypt for tests
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockImplementation((plaintext, _hash) => Promise.resolve(plaintext === "correctPassword")),
}));

type MockRepository<T extends ObjectLiteral> = Record<keyof Repository<T>, jest.Mock>;

// Mock repository factory
const createMockRepository = <T extends ObjectLiteral>(): MockRepository<T> =>
  ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    // Add any other methods you use in your service
  }) as MockRepository<T>;

// Factory helper for User entity
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: TEST_USER_ID_1,
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  password: "hashed-password",
  emailVerified: false,
  isActive: true,
  createdAt: new Date(),
  modifiedAt: new Date(),
  roles: [{ id: TEST_USER_ROLE_ID, name: "USER" } as Role],
  bookings: [],
  hashPassword: async () => Promise.resolve(),
  comparePassword: async (_plaintext: string) => Promise.resolve(true),
  ...overrides,
});

describe("UsersService", () => {
  let service: UsersService;
  let mockUserRepository: MockRepository<User>;
  let mockRoleRepository: MockRepository<Role>;

  beforeEach(async () => {
    // Mock implementations
    mockUserRepository = createMockRepository<User>();
    mockRoleRepository = createMockRepository<Role>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
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
      const mockUser = createMockUser();
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail("test@example.com");
      expect(result).toMatchObject(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        relations: ["roles"],
      });
    });

    it("should return null if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail("nonexistent@example.com");
      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: "nonexistent@example.com" },
        relations: ["roles"],
      });
    });
  });

  describe("findById", () => {
    it("should return a user if found", async () => {
      const mockUser = createMockUser();
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(TEST_USER_ID_1);
      expect(result).toMatchObject(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: TEST_USER_ID_1 },
        relations: ["roles"],
      });
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(TEST_NON_EXISTENT_BOOKING_ID)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: TEST_NON_EXISTENT_BOOKING_ID },
        relations: ["roles"],
      });
    });
  });

  describe("register", () => {
    it("should create a new user", async () => {
      jest.clearAllMocks();
      const registerDto = {
        email: "new@example.com",
        firstName: "New",
        lastName: "User",
        password: "password123",
      };

      const newUser = createMockUser({
        id: TEST_USER_ID_2,
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roles: [{ id: TEST_USER_ROLE_ID, name: "USER" } as Role],
      });

      // Chain mocks for findOne: 1st call is for checking existence (null), 2nd is for reloading the user
      mockUserRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(newUser);
      mockRoleRepository.findOne.mockResolvedValue({ id: TEST_USER_ROLE_ID, name: "USER" } as Role);
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: newUser.id },
        relations: ["roles"],
      });

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({ where: { name: "USER" } });

      expect(result).toMatchObject({
        id: TEST_USER_ID_2,
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roles: [{ id: TEST_USER_ROLE_ID, name: "USER" } as Role],
      });
    });

    it("should throw ConflictException if email is already in use", async () => {
      const registerDto = { email: "existing@example.com", password: "password123", firstName: "a", lastName: "b" };
      mockUserRepository.findOne.mockResolvedValue(createMockUser({ email: "existing@example.com" }));

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it("should throw Error for database errors", async () => {
      const registerDto = { email: "new@example.com", password: "password123", firstName: "a", lastName: "b" };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.save.mockRejectedValue(new Error("DB error"));

      await expect(service.register(registerDto)).rejects.toThrow("DB error");
    });
  });

  describe("validateUser", () => {
    it("should return user if credentials are valid", async () => {
      const user = createMockUser({ comparePassword: jest.fn().mockResolvedValue(true) });
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser({ email: "test@example.com", password: "correctPassword" });
      expect(result).toEqual(user);
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.validateUser({ email: "wrong@example.com", password: "password" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException if password is incorrect", async () => {
      const user = createMockUser({
        comparePassword: jest.fn().mockResolvedValue(false),
      });
      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(service.validateUser({ email: "test@example.com", password: "wrongPassword" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
