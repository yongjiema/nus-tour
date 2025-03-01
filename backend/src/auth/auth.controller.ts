import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  ConflictException,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../database/entities/user.entity';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      this.logger.log(`Register endpoint called with: ${JSON.stringify(registerDto)}`);
      const result = await this.authService.register(registerDto);
      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email is already in use');
      }
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Registration failed: ${error.message}`);
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any): Promise<{ message: string }> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found'); // Changed from BadRequestException
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided'); // Also changed this for consistency
    }

    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    try {
      return await this.usersService.register(registerDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email is already in use');
      }

      this.logger.error('Registration failed:', error.stack, 'RegisterDto:', registerDto);

      throw new BadRequestException('Registration failed.');
    }
  }
}
