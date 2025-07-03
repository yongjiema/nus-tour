import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./role.decorator";
import { AuthenticatedRequest } from "../common/types/request.types";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) as string[] | undefined;
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRoles = (user.roles ?? [])
      .filter((r): r is string => typeof r === "string" && r.length > 0)
      .map((r: string) => r.toUpperCase());
    return requiredRoles.map((r) => r.toUpperCase()).some((r) => userRoles.includes(r));
  }
}
