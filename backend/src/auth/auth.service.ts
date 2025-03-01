import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
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

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.validateUser(loginDto);
    return {
      access_token: this.jwtService.sign({ email: user.email, id: user.id }, { expiresIn: '60m' }),
    };
  }

  async register(registerDto: RegisterDto): Promise<any> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _confirmPassword, ...userData } = registerDto as any;

      const existingUser = await this.usersService.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }

      const newUser = await this.usersService.register(userData);
      console.log('User created in auth service:', newUser);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = newUser;
      return result;
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
}
