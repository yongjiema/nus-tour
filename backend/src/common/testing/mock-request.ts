import { Request } from "express";
import { AuthenticatedRequest, User } from "../types/request.types";
import { TEST_MOCK_USER_ID } from "./test-uuids";

export function createMockAuthenticatedRequest(user: Partial<User> = {}): AuthenticatedRequest {
  const defaultUser: User = {
    id: TEST_MOCK_USER_ID,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    roles: ["USER"],
    ...user,
  };

  const mockRequest = {
    user: defaultUser,
    headers: {},
    get: jest.fn(),
    header: jest.fn(),
  };

  return mockRequest as unknown as AuthenticatedRequest;
}

export function createMockRequest(options: Partial<Request> = {}): Request {
  const minimal: Partial<Request> = {
    get: jest.fn(),
    header: jest.fn(),
    method: "GET",
    url: "/test",
    headers: {},
    ...options,
  };
  return minimal as unknown as Request;
}
