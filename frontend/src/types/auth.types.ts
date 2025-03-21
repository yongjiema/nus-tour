export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}
