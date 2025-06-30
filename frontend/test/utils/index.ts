// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render method with our custom render
export { render } from "./render";

export { AllTheProviders } from "./test-utils";
export * from "./test-helpers";
