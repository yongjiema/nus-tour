import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from '../database/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: mockUserRepository }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'TestUser',
        password: 'hashedPassword123',
        unhashedPassword: '',
        role: 'user' as const,
        hashPassword: jest.fn(),
        comparePassword: jest.fn(),
      } as User;
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return undefined if no user is found', async () => {
      mockUserRepository.findOne.mockResolvedValue(undefined);

      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeUndefined();
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = { email: 'new@example.com', username: 'NewUser', password: 'password123' };
      const mockUser = { id: 1, ...registerDto } as User;

      // Email not taken
      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'new@example.com' } });
      expect(userRepository.create).toHaveBeenCalledWith(registerDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ConflictException if email is already in use', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        username: 'ExistingUser',
        password: 'password',
      };
      // Simulating an existing user
      mockUserRepository.findOne.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'existing@example.com' } });
    });
  });

  describe('validateUser', () => {
    it('should return a user if credentials are valid', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        username: 'TestUser',
        unhashedPassword: '',
        role: 'user' as const,
        hashPassword: jest.fn(),
        comparePassword: jest.fn().mockResolvedValue(true),
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(loginDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
    });

    it('should throw NotFoundException if credentials are invalid', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        username: 'TestUser',
        unhashedPassword: '',
        role: 'user' as const,
        hashPassword: jest.fn(),
        comparePassword: jest.fn().mockResolvedValue(false),
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.validateUser(loginDto)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const mockUser = {
        id: 1,
        username: 'TestUser',
        email: 'test@example.com',
        password: 'hashedPassword123',
        unhashedPassword: '',
        role: 'user' as const,
        hashPassword: jest.fn(),
        comparePassword: jest.fn(),
      } as User;
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    it('should update a user and return the updated entity', async () => {
      const updateUserDto: UpdateUserDto = { username: 'UpdatedUser' };
      const mockUser = {
        id: 1,
        username: 'TestUser',
        email: 'test@example.com',
        role: 'user' as const,
        password: 'hashedPassword',
        comparePassword: jest.fn(),
        hashPassword: jest.fn(),
        unhashedPassword: '',
      } as User;

      // Simulate finding the user first
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      // Simulate save returning the updated entity
      mockUserRepository.save.mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await service.update(1, updateUserDto);
      expect(result).toEqual({ ...mockUser, ...updateUserDto });
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(userRepository.save).toHaveBeenCalledWith({ ...mockUser, ...updateUserDto });
    });
  });

  describe('delete', () => {
    it('should soft delete a user', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        username: 'TestUser',
        password: 'hashedPassword123',
        unhashedPassword: '',
        role: 'user' as const,
        hashPassword: jest.fn(),
        comparePassword: jest.fn(),
      } as User);
      mockUserRepository.softDelete.mockResolvedValue(undefined);

      await service.delete(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(userRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(service, 'findById').mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('findAll', () => {
    it('should return a list of all users', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'User1',
          email: 'user1@example.com',
          password: 'hashedPassword123',
          unhashedPassword: '',
          role: 'user' as const,
          hashPassword: jest.fn(),
          comparePassword: jest.fn(),
        },
        {
          id: 2,
          username: 'User2',
          email: 'user2@example.com',
          password: 'hashedPassword123',
          unhashedPassword: '',
          role: 'user' as const,
          hashPassword: jest.fn(),
          comparePassword: jest.fn(),
        },
      ] as User[];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalled();
    });

    it('should return an empty array if no users are found', async () => {
      mockUserRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });
});
