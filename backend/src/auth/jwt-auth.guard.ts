import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

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
