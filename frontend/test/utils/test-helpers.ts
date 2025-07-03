import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";

// Helper function for form testing
export const fillFormField = async (
  getByLabelText: (text: string) => HTMLElement,
  labelText: string,
  value: string,
) => {
  const input = getByLabelText(labelText);
  await userEvent.clear(input);
  await userEvent.type(input, value);
};

// Helper function for waiting and assertions
export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
  });
};

// Create a QueryClient for testing
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
