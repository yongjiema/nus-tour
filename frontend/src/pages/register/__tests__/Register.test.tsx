import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../index";
import { render } from "../../../../test/utils/render";

// Mock Refine hooks
const mockLogin: ReturnType<typeof vi.fn> = vi.fn();
const mockNotification: ReturnType<typeof vi.fn> = vi.fn();
const mockCustomMutation: ReturnType<typeof vi.fn> = vi.fn();

vi.mock("@refinedev/core", () => ({
  useLogin: () => ({ mutateAsync: mockLogin }),
  useNotification: () => ({ open: mockNotification }),
  useApiUrl: () => "http://localhost:3000/api",
  useCustomMutation: () => ({ mutate: mockCustomMutation, isPending: false }),
}));

// Mock react-router-dom navigation
const mockNavigate: ReturnType<typeof vi.fn> = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock error handler
vi.mock("../../../utils/errorHandler", () => ({
  useErrorHandler: () => ({
    handleError: (err: Error | { message?: string }) => err.message ?? "An error occurred",
  }),
  handleRefineError: (error: unknown, _open?: unknown) => {
    if (error && typeof error === "object" && "message" in error) {
      return (error as { message: string }).message;
    }
    return "An error occurred";
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
const mockedFetch = mockFetch as typeof fetch;
global.fetch = mockedFetch;

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup successful fetch response by default
    vi.mocked(mockFetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "test-token",
          user: {
            id: "test-id",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            roles: ["USER"],
          },
        }),
    } as unknown as Response);

    // Clear localStorage
    localStorage.clear();
  });

  it("renders registration form with all fields", () => {
    render(<RegisterPage />);

    expect(screen.getByRole("heading", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    // Check for password fields using name attributes
    expect(document.querySelector('input[name="password"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="confirmPassword"]')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<RegisterPage />);

    const submitButton = screen.getByRole("button", { name: /register/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      // Check for password validation more generally
      const passwordErrors = screen.getAllByText(/password is required/i);
      expect(passwordErrors.length).toBeGreaterThan(0);
    });
  });

  it("validates email format", async () => {
    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: /register/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it("validates password confirmation match", async () => {
    render(<RegisterPage />);

    // Use direct DOM queries for password fields
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');

    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();

    if (!passwordInput || !confirmPasswordInput) {
      throw new Error("Password inputs not found");
    }

    await userEvent.type(passwordInput, "password123");
    await userEvent.type(confirmPasswordInput, "differentpassword");

    const submitButton = screen.getByRole("button", { name: /register/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
    });
  });

  it("validates minimum password length", async () => {
    render(<RegisterPage />);

    // Use direct DOM query for password field
    const passwordInput = document.querySelector('input[name="password"]');
    expect(passwordInput).toBeInTheDocument();

    if (!passwordInput) {
      throw new Error("Password input not found");
    }

    await userEvent.type(passwordInput, "short");

    const submitButton = screen.getByRole("button", { name: /register/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("submits registration with valid data", async () => {
    render(<RegisterPage />);

    // Use updated field names
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');

    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();

    if (!passwordInput || !confirmPasswordInput) {
      throw new Error("Password inputs not found");
    }

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");
    await userEvent.type(emailInput, "john@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /register/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCustomMutation).toHaveBeenCalledWith(
        {
          url: "auth/register",
          method: "post",
          values: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "password123",
          },
        },
        expect.any(Object),
      );
    });
  });

  it("displays error message on registration failure", async () => {
    const errorMessage = "Email already exists";
    mockCustomMutation.mockImplementation((_, options: unknown) => {
      if (
        options &&
        typeof options === "object" &&
        "onError" in options &&
        typeof (options as { onError?: unknown }).onError === "function"
      ) {
        (options as { onError: (err: Error) => void }).onError(new Error(errorMessage));
      }
    });

    render(<RegisterPage />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');

    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();

    if (!passwordInput || !confirmPasswordInput) {
      throw new Error("Password inputs not found");
    }

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");
    await userEvent.type(emailInput, "existing@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /register/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
