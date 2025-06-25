import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { NotFoundException, Logger } from "@nestjs/common";
import {
  TEST_USER_ID_50,
  TEST_USER_ID_51,
  UserBuilder,
  createMockAuthenticatedRequest,
  TEST_USER_ROLE_ID,
  TEST_ADMIN_ROLE_ID,
  TEST_NON_EXISTENT_USER_ID,
} from "../common/testing";
import { UpdateUserDto } from "../auth/dto/update-user.dto";
import { User } from "../database/entities/user.entity";
import { Role } from "../database/entities/role.entity";
import { AuthenticatedRequest } from "../common/types/request.types";

describe("UsersController", () => {
  let usersController: UsersController;
  let usersService: Partial<UsersService>;

  const mockUsersService = {
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
  };

  const defaultRoles: Role[] = [{ id: TEST_USER_ROLE_ID, name: "USER" } as Role];

  // Helper to quickly create fully-typed User mocks with overrides
  function buildUser(overrides: Partial<User> = {}): User {
    const baseUser = UserBuilder.create().buildPartial();
    return {
      ...baseUser,
      ...overrides,
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    } as User;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(usersController).toBeDefined();
  });

  describe("getProfile", () => {
    it("should return the user profile if found", async () => {
      const mockUser: User = buildUser({
        id: TEST_USER_ID_50,
        firstName: "TestUser",
        lastName: "TestUser",
        email: "test@example.com",
        roles: defaultRoles,
        bookings: [],
      });

      jest.spyOn(usersService, "findById").mockResolvedValue(mockUser);
      const req = createMockAuthenticatedRequest({ id: TEST_USER_ID_50 });
      const result = await usersController.getProfile(req);
      expect(result).toEqual({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        roles: mockUser.roles.map((r) => r.name),
      });
      expect(usersService.findById).toHaveBeenCalledWith(TEST_USER_ID_50);
    });

    it("should throw NotFoundException if user is not found", async () => {
      jest.spyOn(usersService, "findById").mockRejectedValue(new NotFoundException("User not found"));
      const req = { user: { id: TEST_NON_EXISTENT_USER_ID } } as AuthenticatedRequest;
      await expect(usersController.getProfile(req)).rejects.toThrow(NotFoundException);
      expect(usersService.findById).toHaveBeenCalledWith(TEST_NON_EXISTENT_USER_ID);
    });
  });

  describe("updateProfile", () => {
    it("should update the user profile and return the updated user", async () => {
      const mockUpdatedUser: User = buildUser({
        id: TEST_USER_ID_50,
        firstName: "UpdatedUser",
        lastName: "UpdatedUser",
        email: "updated@example.com",
        roles: defaultRoles,
        bookings: [],
      });
      const updateUserDto: UpdateUserDto = {
        firstName: "UpdatedUser",
        lastName: "UpdatedUser",
        email: "updated@example.com",
      };
      jest.spyOn(usersService, "update").mockResolvedValue(mockUpdatedUser);
      const req = { user: { id: TEST_USER_ID_50 } } as AuthenticatedRequest;
      const result = await usersController.updateProfile(req, updateUserDto);
      expect(result).toEqual({
        id: mockUpdatedUser.id,
        firstName: mockUpdatedUser.firstName,
        lastName: mockUpdatedUser.lastName,
        email: mockUpdatedUser.email,
        roles: mockUpdatedUser.roles.map((r) => r.name),
      });
      expect(usersService.update).toHaveBeenCalledWith(TEST_USER_ID_50, updateUserDto);
    });

    it("should throw NotFoundException if user to update is not found", async () => {
      const updateUserDto: UpdateUserDto = { firstName: "NonExistentUser" };
      jest.spyOn(usersService, "update").mockRejectedValue(new NotFoundException("User not found"));
      const req = { user: { id: TEST_NON_EXISTENT_USER_ID } } as AuthenticatedRequest;
      await expect(usersController.updateProfile(req, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(usersService.update).toHaveBeenCalledWith(TEST_NON_EXISTENT_USER_ID, updateUserDto);
    });

    it("should accept partial updates with only firstName", async () => {
      const mockUpdatedUser: User = buildUser({
        id: TEST_USER_ID_50,
        firstName: "UpdatedFirstName",
        lastName: "ExistingLastName",
        email: "existing@example.com",
        roles: defaultRoles,
        bookings: [],
      });

      const updateUserDto: UpdateUserDto = { firstName: "UpdatedFirstName" };
      jest.spyOn(usersService, "update").mockResolvedValue(mockUpdatedUser);
      const req = { user: { id: TEST_USER_ID_50 } } as AuthenticatedRequest;
      const result = await usersController.updateProfile(req, updateUserDto);
      expect(result).toEqual({
        id: mockUpdatedUser.id,
        firstName: mockUpdatedUser.firstName,
        lastName: mockUpdatedUser.lastName,
        email: mockUpdatedUser.email,
        roles: mockUpdatedUser.roles.map((r) => r.name),
      });
      expect(usersService.update).toHaveBeenCalledWith(TEST_USER_ID_50, updateUserDto);
    });

    it("should accept partial updates with only lastName", async () => {
      const mockUpdatedUser: User = buildUser({
        id: TEST_USER_ID_50,
        firstName: "ExistingFirstName",
        lastName: "UpdatedLastName",
        email: "existing@example.com",
        roles: defaultRoles,
        bookings: [],
      });

      const updateUserDto: UpdateUserDto = { lastName: "UpdatedLastName" };
      jest.spyOn(usersService, "update").mockResolvedValue(mockUpdatedUser);
      const req = { user: { id: TEST_USER_ID_50 } } as AuthenticatedRequest;
      const result = await usersController.updateProfile(req, updateUserDto);
      expect(result).toEqual({
        id: mockUpdatedUser.id,
        firstName: mockUpdatedUser.firstName,
        lastName: mockUpdatedUser.lastName,
        email: mockUpdatedUser.email,
        roles: mockUpdatedUser.roles.map((r) => r.name),
      });
      expect(usersService.update).toHaveBeenCalledWith(TEST_USER_ID_50, updateUserDto);
    });

    it("should accept partial updates with only email", async () => {
      const mockUpdatedUser: User = buildUser({
        id: TEST_USER_ID_50,
        firstName: "ExistingFirstName",
        lastName: "ExistingLastName",
        email: "updated@example.com",
        roles: defaultRoles,
        bookings: [],
      });

      const updateUserDto: UpdateUserDto = { email: "updated@example.com" };
      jest.spyOn(usersService, "update").mockResolvedValue(mockUpdatedUser);
      const req = { user: { id: TEST_USER_ID_50 } } as AuthenticatedRequest;
      const result = await usersController.updateProfile(req, updateUserDto);
      expect(result).toEqual({
        id: mockUpdatedUser.id,
        firstName: mockUpdatedUser.firstName,
        lastName: mockUpdatedUser.lastName,
        email: mockUpdatedUser.email,
        roles: mockUpdatedUser.roles.map((r) => r.name),
      });
      expect(usersService.update).toHaveBeenCalledWith(TEST_USER_ID_50, updateUserDto);
    });
  });

  describe("deleteAccount", () => {
    it("should delete the user account and return a success message", async () => {
      jest.spyOn(usersService, "delete").mockResolvedValue(undefined);
      const req = { user: { id: TEST_USER_ID_50 } } as AuthenticatedRequest;
      const result = await usersController.deleteAccount(req);
      expect(result).toEqual({ message: "Account deleted successfully." });
      expect(usersService.delete).toHaveBeenCalledWith(TEST_USER_ID_50);
    });

    it("should throw NotFoundException if user to delete is not found", async () => {
      jest.spyOn(usersService, "delete").mockRejectedValue(new NotFoundException("User not found"));
      const req = { user: { id: TEST_NON_EXISTENT_USER_ID } } as AuthenticatedRequest;
      await expect(usersController.deleteAccount(req)).rejects.toThrow(NotFoundException);
      expect(usersService.delete).toHaveBeenCalledWith(TEST_NON_EXISTENT_USER_ID);
    });
  });

  describe("getAllUsers", () => {
    it("should return a list of all users", async () => {
      const mockUsers: User[] = [
        buildUser({
          id: TEST_USER_ID_50,
          firstName: "User1",
          lastName: "User1",
          email: "user1@example.com",
          roles: defaultRoles,
          bookings: [],
        }),
        buildUser({
          id: TEST_USER_ID_51,
          firstName: "User2",
          lastName: "User2",
          email: "user2@example.com",
          roles: [{ id: TEST_ADMIN_ROLE_ID, name: "ADMIN" } as Role],
          bookings: [],
        }),
      ];
      jest.spyOn(usersService, "findAll").mockResolvedValue(mockUsers);
      const result = await usersController.getAllUsers();
      expect(result).toEqual(
        mockUsers.map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          roles: u.roles.map((r) => r.name),
        })),
      );
      expect(usersService.findAll).toHaveBeenCalled();
    });

    it("should return an empty array if no users are found", async () => {
      jest.spyOn(usersService, "findAll").mockResolvedValue([]);
      const result = await usersController.getAllUsers();
      expect(result).toEqual([]);
      expect(usersService.findAll).toHaveBeenCalled();
    });

    it("should filter out sensitive information", async () => {
      const mockUsers: User[] = [
        buildUser({
          id: TEST_USER_ID_50,
          firstName: "User1",
          lastName: "User1",
          email: "user1@example.com",
          roles: defaultRoles,
        }),
      ];

      // The service itself should filter sensitive information
      const filteredUsers = mockUsers.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles.map((r) => r.name),
      }));

      jest.spyOn(usersService, "findAll").mockResolvedValue(filteredUsers as unknown as User[]);
      const result = await usersController.getAllUsers();

      // Ensure password is not in the response
      expect(result[0]).not.toHaveProperty("password");
      expect(result).toEqual(filteredUsers);
    });
  });
});
