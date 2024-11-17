import { Controller, Post, Body, Request, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User Login
   * Validates user credentials and issues a JWT token.
   * @param loginDto - User credentials (email and password)
   * @returns JWT token
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * User Registration
   * Registers a new user and issues a JWT token upon successful registration.
   * @param registerDto - New user details (email, username, password)
   * @returns JWT token
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch {
      throw new BadRequestException('Registration failed.');
    }
  }

  /**
   * User Logout
   * Invalidates the current token.
   * @param req - HTTP request containing the authorization header with the token
   * @returns Logout confirmation message
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any): Promise<{ message: string }> {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }
}
