import { User } from "../../database/entities/user.entity";
import { Role } from "../../database/entities/role.entity";
import { AuthenticatedRequest } from "../types/request.types";
import { TEST_MOCK_USER_ID, TEST_USER_ROLE_ID, TEST_ADMIN_ROLE_ID } from "./test-uuids";

/**
 * Test Builders - Industry best practice for creating test data
 * Provides fluent API for building test objects with sensible defaults
 */

export class UserBuilder {
  private user: Partial<User> = {
    id: TEST_MOCK_USER_ID,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    roles: [{ id: TEST_USER_ROLE_ID, name: "USER" } as Role],
    bookings: [],
    password: "hashedPassword",
    emailVerified: false,
    isActive: true,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  static create(): UserBuilder {
    return new UserBuilder();
  }

  withId(id: string): this {
    this.user.id = id;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withRole(role: string): this {
    this.user.roles = [{ id: TEST_USER_ROLE_ID, name: role.toUpperCase() } as Role];
    return this;
  }

  asAdmin(): this {
    this.user.roles = [{ id: TEST_ADMIN_ROLE_ID, name: "ADMIN" } as Role];
    return this;
  }

  build(): User {
    return {
      ...this.user,
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    } as User;
  }

  buildPartial(): Partial<User> {
    return this.user;
  }
}

/**
 * Mock Request Builders
 */
export const MockRequestBuilder = {
  authenticated(user?: Partial<User>): AuthenticatedRequest {
    const defaultUser = UserBuilder.create().buildPartial();
    const requestUser: User = { ...defaultUser, ...user } as User;

    return {
      user: requestUser,
      headers: {},
      get: jest.fn(),
      header: jest.fn(),
    } as unknown as AuthenticatedRequest;
  },

  withHeaders(headers: Record<string, string>) {
    return {
      headers,
      get: jest.fn(),
      header: jest.fn(),
    } as { headers: Record<string, string>; get: jest.Mock; header: jest.Mock };
  },
} as const;

/**
 * Repository Mock Builder - returns a generic mocked repository-like object
 */
export function createMockRepository<T extends object>() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as jest.Mocked<Record<keyof T | string, jest.Mock>>;
}
