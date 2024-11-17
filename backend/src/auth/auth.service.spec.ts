import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn(() => 'mocked-token'),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    register: jest.fn(),
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

  it('should register a new user and return a token', async () => {
    const registerDto: RegisterDto = { email: 'test@example.com', username: 'Test User', password: 'password' };
    mockUsersService.findByEmail.mockResolvedValue(null);
    mockUsersService.register.mockResolvedValue({ id: 1, email: 'test@example.com', username: 'Test User' });

    const result = await service.register(registerDto);

    expect(result).toEqual({ token: 'mocked-token' });
    expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockUsersService.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com', username: 'Test User' }),
    );
    expect(mockJwtService.sign).toHaveBeenCalledWith({ id: 1, email: 'test@example.com' }, expect.any(Object));
  });

  it('should throw an error for an existing user during registration', async () => {
    mockUsersService.findByEmail.mockResolvedValue({ email: 'test@example.com' });

    await expect(
      service.register({ email: 'test@example.com', password: 'password', username: 'Test User' }),
    ).rejects.toThrow();
    expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
  });
});
