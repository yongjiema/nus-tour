import { afterEach, vi, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver
const MockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal("ResizeObserver", MockResizeObserver);

// Mock Recharts
vi.mock("recharts", async () => {
  const OriginalModule = await vi.importActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        "div",
        {
          style: { width: "100%", height: "100%" },
        },
        children,
      ),
  };
});

// Suppress console.error and console.warn during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn((...args: unknown[]) => {
    // Suppress specific known errors
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: An update to %s inside a test was not wrapped in act(...).")
    ) {
      return;
    }
    originalError(...args);
  });
  console.warn = vi.fn((...args: unknown[]) => {
    // Suppress specific known warnings
    if (typeof args[0] === "string" && args[0].includes("MUI: You are using the deprecated")) {
      return;
    }
    originalWarn(...args);
  });
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
