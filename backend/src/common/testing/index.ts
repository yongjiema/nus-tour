/**
 * Central testing utilities export
 * Best practice: Single import point for all testing helpers
 */

// Mock request helpers
export { createMockAuthenticatedRequest, createMockRequest } from "./mock-request";

// Test builders (fluent API for creating test data)
export { UserBuilder, MockRequestBuilder, createMockRepository } from "./test-builders";

// Type exports for test files
export type { AuthenticatedRequest, User } from "../types/request.types";

// Mock logger
export * from "./mock-logger";

// Test UUIDs for consistent testing
export * from "./test-uuids";

/**
 * Usage Examples:
 *
 * // Simple mock request
 * const req = createMockAuthenticatedRequest({ id: '123e4567-e89b-12d3-a456-426614174000' });
 *
 * // Using builders (recommended)
 * const user = UserBuilder.create()
 *   .withId('123e4567-e89b-12d3-a456-426614174000')
 *   .asAdmin()
 *   .build();
 * const req = MockRequestBuilder.authenticated({ id: '123e4567-e89b-12d3-a456-426614174000' });
 *
 * // Mock repository for service tests
 * const mockRepo = createMockRepository<User>();
 */
