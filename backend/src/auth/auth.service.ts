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

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.validateUser(loginDto);
    return {
      access_token: this.jwtService.sign({ email: user.email, id: user.id }, { expiresIn: '60m' }),
    };
  }

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }
    const newUser = await this.usersService.register(registerDto);
    const payload = { id: newUser.id, email: newUser.email };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return { token };
  }

  async logout(token: string): Promise<void> {
    this.jwtBlacklist.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.jwtBlacklist.has(token);
  }
}
