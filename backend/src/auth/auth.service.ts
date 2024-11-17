import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private jwtBlacklist: Set<string> = new Set(); // In-memory blacklist for simplicity

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * User Login
   * Validates the user and issues a JWT token.
   * @param loginDto - User credentials (email and password)
   * @returns JWT token
   */
  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const user = await this.usersService.validateUser(loginDto);

    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    return { token };
  }

  /**
   * User Registration
   * Registers a new user and issues a JWT token upon successful registration.
   * @param registerDto - New user details (email, username, password)
   * @returns JWT token
   */
  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const newUser = await this.usersService.register(registerDto);

    const payload = { id: newUser.id, email: newUser.email };
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    return { token };
  }

  /**
   * Logout
   * Blacklists the given JWT token.
   * @param token - JWT token to be blacklisted
   */
  async logout(token: string): Promise<void> {
    this.jwtBlacklist.add(token); // Blacklist the token
  }

  /**
   * Check if a token is blacklisted.
   * @param token - JWT token to check
   * @returns true if the token is blacklisted, false otherwise
   */
  isTokenBlacklisted(token: string): boolean {
    return this.jwtBlacklist.has(token);
  }
}
