import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { TokenBlacklistService } from "./token-blacklist.service";
import { User } from "../database/entities/user.entity";
import * as bcrypt from "bcrypt";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: UserResponseDto }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const roles = user.roles.map((r) => r.name.toUpperCase());
    const payload = { email: user.email, sub: user.id, roles, firstName: user.firstName, lastName: user.lastName };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<{ access_token: string; user: UserResponseDto }> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.register({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: hashedPassword,
    });

    const roles = user.roles.map((r) => r.name.toUpperCase());
    const payload = { email: user.email, sub: user.id, roles, firstName: user.firstName, lastName: user.lastName };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
      },
    };
  }

  logout(token: string): void {
    this.tokenBlacklistService.addToBlacklist(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklistService.isBlacklisted(token);
  }

  async refreshToken(token: string): Promise<{ access_token: string; user: UserResponseDto }> {
    try {
      const decoded: unknown = this.jwtService.verify(token);
      if (this.isValidTokenPayload(decoded)) {
        const user = await this.usersService.findById(decoded.sub);
        return this.createToken(user);
      }
      throw new UnauthorizedException("Invalid token payload");
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }

  private isValidTokenPayload(payload: unknown): payload is { sub: string; email: string } {
    return (
      typeof payload === "object" &&
      payload !== null &&
      "sub" in payload &&
      typeof (payload as { sub: unknown }).sub === "string" &&
      "email" in payload &&
      typeof (payload as { email: unknown }).email === "string"
    );
  }

  createToken(user: User): { access_token: string; user: UserResponseDto } {
    const roles = user.roles.map((r) => r.name.toUpperCase());
    const payload = {
      sub: user.id,
      email: user.email,
      roles,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
      },
    };
  }

  async getUserFromToken(token: string): Promise<{ id: string; email: string } | null> {
    try {
      const decoded: unknown = this.jwtService.verify(token);
      if (this.isValidTokenPayload(decoded)) {
        const user = await this.usersService.findById(decoded.sub);
        return { id: user.id, email: user.email };
      }
      return null;
    } catch (_error) {
      return null;
    }
  }
}
