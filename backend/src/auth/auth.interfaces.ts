export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role?: string;
    [key: string]: any;
  };
}
