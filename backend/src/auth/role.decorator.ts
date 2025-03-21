import { SetMetadata } from "@nestjs/common";

/**
 * Key used to store roles metadata
 */
export const ROLES_KEY = "roles";

/**
 * Decorator that assigns roles to route handlers
 * @param roles - Array of role names that can access the route
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
