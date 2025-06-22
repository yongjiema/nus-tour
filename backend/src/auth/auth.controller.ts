import { Controller, Post, Body, UseGuards, Request, Get, Logger, UnauthorizedException } from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { User } from "../database/entities/user.entity";
import { UsersService } from "../users/users.service";
import { AuthenticatedRequest } from "../common/types/request.types";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Register endpoint called with: ${JSON.stringify(registerDto)}`);
    const result = await this.authService.register(registerDto);
    return result;
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  logout(@Request() req: ExpressRequest): { message: string } {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException("No authorization header found");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    this.authService.logout(token);
    return { message: "Logged out successfully" };
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @Post("refresh")
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Request() req: ExpressRequest) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("Token not provided");
    }

    return await this.authService.refreshToken(token);
  }
}

@Controller("users")
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post("register")
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return await this.usersService.register(registerDto);
  }
}
