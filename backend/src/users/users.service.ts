import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, username, password } = registerDto;

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const user = this.usersRepository.create({ email, username, password });
    return this.usersRepository.save(user);
  }

  async validateUser(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      throw new NotFoundException('Invalid email or password');
    }

    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.softDelete(id);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService, // Inject AuthService to check blacklisted tokens
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Extract the token from the Authorization header
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token is missing or improperly formatted');
    }

    try {
      // Check if the token is blacklisted
      if (this.authService.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token has been blacklisted');
      }

      // Verify the token
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET, // Explicitly use a configured secret key
        algorithms: ['HS256'], // Ensure only allowed algorithms are used
      });

      // Attach the decoded payload to the request for further use
      request.user = decoded;

      return true;
    } catch (error) {
      console.error('Token verification error:', error.message);
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }

  /**
   * Extract the JWT token from the Authorization header.
   * @param request - HTTP request object
   * @returns Extracted token or throws an error if missing/invalid
   */
  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format. Expected "Bearer <token>".');
    }

    return token;
  }
}
