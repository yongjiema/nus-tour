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

// Legacy exports for compatibility
export * from "./mock-logger";

/**
 * Usage Examples:
 *
 * // Simple mock request
 * const req = createMockAuthenticatedRequest({ id: 'user-123' });
 *
 * // Using builders (recommended)
 * const user = UserBuilder.create().withId('user-123').asAdmin().build();
 * const req = MockRequestBuilder.authenticated({ id: 'user-123' });
 *
 * // Mock repository for service tests
 * const mockRepo = MockRepositoryBuilder.forEntity<User>();
 *
 * // Complex test data
 * const booking = BookingBuilder.create()
 *   .withId(123)
 *   .withStatus(BookingLifecycleStatus.COMPLETED)
 *   .build();
 */
