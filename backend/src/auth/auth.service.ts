import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
    const user = await this.usersService.validateUser(loginDto);

    // Include username in the token payload
    const access_token = this.jwtService.sign(
      {
        email: user.email,
        id: user.id,
        username: user.username,
      },
      { expiresIn: '60m' },
    );

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<{ access_token: string; user: any }> {
    try {
      const { ...userData } = registerDto as any;

      const existingUser = await this.usersService.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }

      const newUser = await this.usersService.register(userData);
      const { ...userWithoutPassword } = newUser;

      // Include username in the token payload
      const access_token = this.jwtService.sign(
        {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
        },
        { expiresIn: '60m' },
      );

      return {
        access_token,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('Registration error details:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Registration failed: ${error.message}`);
    }
  }

  async logout(token: string): Promise<void> {
    this.tokenBlacklistService.addToBlacklist(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklistService.isBlacklisted(token);
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      // Check if token is blacklisted
      if (this.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token is invalid or has been revoked');
      }

      // Verify and decode the token
      const decoded = this.jwtService.verify(token);

      // Get the user
      const user = await this.usersService.findById(decoded.sub || decoded.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate a new token
      return this.createToken(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token or token has expired');
    }
  }

  async createToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      username: user.username, // Add username to payload
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '60m' }),
    };
  }
}
