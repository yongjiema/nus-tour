import { Request } from "express";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  /** Roles assigned to the user. */
  roles?: string[];
}

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface QueryRequest extends Request {
  query: Record<string, string | string[] | undefined>;
}

// Mock types for testing
export interface MockRequest {
  user: User;
  headers?: Record<string, string>;
}
