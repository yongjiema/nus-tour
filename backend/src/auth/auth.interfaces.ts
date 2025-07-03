export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    roles: string[];
    firstName?: string;
    lastName?: string;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

export interface JwtValidateReturn {
  userId: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
}
