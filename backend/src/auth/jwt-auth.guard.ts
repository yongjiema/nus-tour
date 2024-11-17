import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token is missing or improperly formatted');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET, // Explicitly use a configured secret key
        algorithms: ['HS256'], // Ensure only allowed algorithms are used
      });
      request.user = decoded; // Attach the decoded payload to the request
      return true;
    } catch (error) {
      console.error('Token verification error:', error.message);
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }

  /**
   * Extract the JWT token from the Authorization header.
   * @param request - HTTP request object
   * @returns Extracted token or null
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
