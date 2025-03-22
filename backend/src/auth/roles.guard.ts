import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./role.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get roles required for this route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user from the request object
    const { user } = context.switchToHttp().getRequest();

    // Make sure user exists and has roles
    if (!user || (!user.roles && !user.role)) {
      throw new ForbiddenException("User has no roles assigned");
    }

    // Normalize user roles to uppercase array
    const userRoles = Array.isArray(user.roles)
      ? user.roles.map((role) => role.toUpperCase())
      : [user.role.toUpperCase()];

    // Check if user has any of the required roles (case-insensitive)
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role.toUpperCase()));

    if (!hasRequiredRole) {
      throw new ForbiddenException("You do not have permission to access this resource");
    }

    return hasRequiredRole;
  }
}
