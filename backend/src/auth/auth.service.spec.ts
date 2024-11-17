import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn(() => 'mocked-token'),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a new user', async () => {
    const registerDto: RegisterDto = { email: 'test@example.com', name: 'Test User', password: 'password' };
    mockUsersService.findByEmail.mockResolvedValue(null);
    mockUsersService.create.mockResolvedValue(registerDto);

    const result = await service.register(registerDto);

    expect(result).toEqual({ message: 'User registered successfully' });
    expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockUsersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com', name: 'Test User' }),
    );
  });

  it('should throw an error for an existing user', async () => {
    mockUsersService.findByEmail.mockResolvedValue({ email: 'test@example.com' });

    await expect(
      service.register({ email: 'test@example.com', password: 'password', name: 'Test User' }),
    ).rejects.toThrow();
    expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should return an access token for valid login', async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    mockUsersService.findByEmail.mockResolvedValue({
      email: 'test@example.com',
      password: hashedPassword,
    });

    const result = await service.login({ email: 'test@example.com', password: 'password' });

    expect(result).toEqual({ accessToken: 'mocked-token' });
    expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockJwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com' }));
  });

  it('should throw an error for invalid credentials', async () => {
    mockUsersService.findByEmail.mockResolvedValue({
      email: 'test@example.com',
      password: await bcrypt.hash('password', 10),
    });

    await expect(service.login({ email: 'test@example.com', password: 'wrongpassword' })).rejects.toThrow();
    expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should throw an error for a non-existent user during login', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    await expect(service.login({ email: 'nonexistent@example.com', password: 'password' })).rejects.toThrow();
    expect(mockUsersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
  });
});
