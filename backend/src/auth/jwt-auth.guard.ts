import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token is missing or improperly formatted');
    }

    try {
      if (this.tokenBlacklistService.isBlacklisted(token)) {
        throw new UnauthorizedException('Token has been blacklisted');
      }

      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'secret',
        algorithms: ['HS256'],
      });

      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    if (typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authorization header must be a string');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format. Expected "Bearer <token>".');
    }

    return token;
  }
}
