// Re-export everything from testing-library except 'render'
export {
  act,
  cleanup,
  fireEvent,
  getByLabelText,
  getByPlaceholderText,
  getByRole,
  getByTestId,
  getByText,
  queryByLabelText,
  queryByPlaceholderText,
  queryByRole,
  queryByTestId,
  queryByText,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";

// Export custom render
export { render } from "./render";

export { AllTheProviders } from "./test-utils";
export * from "./test-helpers";
