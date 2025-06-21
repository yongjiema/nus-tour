export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role?: string;
    username?: string;
    roles?: string[];
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface JwtValidateReturn {
  userId: string;
  email: string;
  role: string;
  username: string;
}
