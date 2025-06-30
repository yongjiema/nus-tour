import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../index";
import { render } from "../../../../test/utils/render";

// Mock Refine hooks
const mockLogin: ReturnType<typeof vi.fn> = vi.fn();
const mockNotification: ReturnType<typeof vi.fn> = vi.fn();

vi.mock("@refinedev/core", () => ({
  useLogin: () => ({ mutateAsync: mockLogin }),
  useNotification: () => ({ open: mockNotification }),
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
    handleError: (err: Error) => err.message || "An error occurred",
  }),
}));

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue({ success: true });

    // Clear localStorage
    localStorage.clear();

    vi.spyOn(console, "error").mockImplementation(() => {
      // Suppress console.error during tests
    });
  });

  it("renders login form with all fields", () => {
    render(<Login />);

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<Login />);

    const submitButton = screen.getByRole("button", { name: /login/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: /login/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it("submits form with valid credentials", async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("displays error message on login failure", async () => {
    const errorMessage = "Invalid credentials";
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "wrongpassword");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
