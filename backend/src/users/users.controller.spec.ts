import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: Partial<UsersService>;

  const mockUsersService = {
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
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

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the user profile if found', async () => {
      const mockUser = {
        id: 1,
        username: 'TestUser',
        email: 'test@example.com',
        role: 'user' as const,
        password: 'hashedPassword',
        unhashedPassword: '',
        hashPassword: jest.fn(),
        comparePassword: jest.fn(),
      };

      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);
      const req = { user: { id: 1 } };
      const result = await usersController.getProfile(req);
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(usersService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(usersService, 'findById').mockRejectedValue(new NotFoundException('User not found'));
      const req = { user: { id: 1 } };
      await expect(usersController.getProfile(req)).rejects.toThrow(NotFoundException);
      expect(usersService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateProfile', () => {
    it('should update the user profile and return the updated user', async () => {
      const mockUpdatedUser = {
        id: 1,
        username: 'UpdatedUser',
        email: 'updated@example.com',
        role: 'user' as const,
        password: 'hashedPassword',
        unhashedPassword: '',
        hashPassword: jest.fn(),
        comparePassword: jest.fn(),
      };
      const updateUserDto: UpdateUserDto = { username: 'UpdatedUser', email: 'updated@example.com' };
      jest.spyOn(usersService, 'update').mockResolvedValue(mockUpdatedUser);
      const req = { user: { id: 1 } };
      const result = await usersController.updateProfile(req, updateUserDto);
      expect(result).toEqual({
        id: mockUpdatedUser.id,
        username: mockUpdatedUser.username,
        email: mockUpdatedUser.email,
        role: mockUpdatedUser.role,
      });
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      const updateUserDto: UpdateUserDto = { username: 'NonExistentUser' };
      jest.spyOn(usersService, 'update').mockRejectedValue(new NotFoundException('User not found'));
      const req = { user: { id: 1 } };
      await expect(usersController.updateProfile(req, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('deleteAccount', () => {
    it('should delete the user account and return a success message', async () => {
      jest.spyOn(usersService, 'delete').mockResolvedValue(undefined);
      const req = { user: { id: 1 } };
      const result = await usersController.deleteAccount(req);
      expect(result).toEqual({ message: 'Account deleted successfully.' });
      expect(usersService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user to delete is not found', async () => {
      jest.spyOn(usersService, 'delete').mockRejectedValue(new NotFoundException('User not found'));
      const req = { user: { id: 1 } };
      await expect(usersController.deleteAccount(req)).rejects.toThrow(NotFoundException);
      expect(usersService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getAllUsers', () => {
    it('should return a list of all users', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'User1',
          email: 'user1@example.com',
          role: 'user' as const,
          password: 'hashedPassword',
          unhashedPassword: '',
          hashPassword: jest.fn(),
          comparePassword: jest.fn(),
        },
        {
          id: 2,
          username: 'User2',
          email: 'user2@example.com',
          role: 'admin' as const,
          password: 'hashedPassword',
          unhashedPassword: '',
          hashPassword: jest.fn(),
          comparePassword: jest.fn(),
        },
      ];
      jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUsers);
      const result = await usersController.getAllUsers();
      expect(result).toEqual(
        mockUsers.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        })),
      );
      expect(usersService.findAll).toHaveBeenCalled();
    });

    it('should return an empty array if no users are found', async () => {
      jest.spyOn(usersService, 'findAll').mockResolvedValue([]);
      const result = await usersController.getAllUsers();
      expect(result).toEqual([]);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });
});
