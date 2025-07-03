import { LoggerService } from "@nestjs/common";

/**
 * Mock implementation of NestJS's LoggerService to be used in tests.
 * This allows tests to run without producing log output while still
 * properly implementing the LoggerService interface.
 */
export class MockLogger implements LoggerService {
  log(_message: string, ..._optionalParams: unknown[]): void {
    // Mock implementation - intentionally empty
  }
  error(_message: string, ..._optionalParams: unknown[]): void {
    // Mock implementation - intentionally empty
  }
  warn(_message: string, ..._optionalParams: unknown[]): void {
    // Mock implementation - intentionally empty
  }
  debug(_message: string, ..._optionalParams: unknown[]): void {
    // Mock implementation - intentionally empty
  }
  verbose(_message: string, ..._optionalParams: unknown[]): void {
    // Mock implementation - intentionally empty
  }

  // Add any additional methods you need for testing
  setContext(_context: string): void {
    // Mock implementation - intentionally empty
  }
}
