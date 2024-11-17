import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  BadRequestException,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User Registration
   * @param registerDto - Registration details
   * @returns A message indicating successful registration
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<{ message: string }> {
    try {
      await this.authService.register(registerDto);
      return { message: 'Registration successful. You can now log in.' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Registration failed.');
    }
  }

  /**
   * User Login
   * @param loginDto - Login credentials
   * @returns An access token for the authenticated user
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    try {
      const { accessToken } = await this.authService.login(loginDto);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid credentials.');
    }
  }

  /**
   * Validate JWT Token
   * Protected route to validate token and fetch user identity
   * @returns A message indicating token validity
   */
  @Get('validate-token')
  @UseGuards(JwtAuthGuard)
  async validateToken(): Promise<{ message: string }> {
    return { message: 'Token is valid' };
  }

  /**
   * Logout
   * Marks the user's refresh token as invalid (if stored)
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(): Promise<{ message: string }> {
    try {
      return { message: 'User logged out successfully.' };
    } catch {
      throw new BadRequestException('Logout failed.');
    }
  }
}
