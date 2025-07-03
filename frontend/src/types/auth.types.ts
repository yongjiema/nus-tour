export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: UserRole[];
  avatar?: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}
