import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthenticatedRequest } from "../common/types/request.types";
import { JwtPayload } from "./auth.interfaces";
import { TokenBlacklistService } from "./token-blacklist.service";
import { Reflector } from "@nestjs/core";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid authorization header");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("Token not provided");
    }

    try {
      // Reject if token has been revoked
      if (this.tokenBlacklistService.isBlacklisted(token)) {
        throw new UnauthorizedException("Token revoked");
      }

      const payload: unknown = this.jwtService.verify(token);

      if (!this.isValidPayload(payload)) {
        throw new UnauthorizedException("Invalid token payload");
      }

      // Safely assign the validated payload to the request
      request.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
        role: payload.role,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  private isValidPayload(payload: unknown): payload is JwtPayload {
    return (
      typeof payload === "object" &&
      payload !== null &&
      "sub" in payload &&
      "email" in payload &&
      "role" in payload &&
      "username" in payload
    );
  }
}
