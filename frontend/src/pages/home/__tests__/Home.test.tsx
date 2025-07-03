import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// Mock useNavigate
const mockNavigate = vi.fn();

// Use vi.hoisted to properly hoist the mocks
const { mockUseIsAuthenticated } = vi.hoisted(() => ({
  mockUseIsAuthenticated: vi.fn(),
}));

vi.mock("@refinedev/core", () => ({
  useIsAuthenticated: mockUseIsAuthenticated,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Import after mocking
import { Home } from "../index";

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>,
  );
};

describe("Home Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  it("renders all main elements", () => {
    mockUseIsAuthenticated.mockReturnValue({ data: { authenticated: false } });

    renderHome();

    expect(screen.getByText("Welcome to NUS Tour")).toBeInTheDocument();
    expect(screen.getByText("Learn More About NUS")).toBeInTheDocument();
    expect(screen.getByText("Book a Campus Tour")).toBeInTheDocument();
    expect(screen.getByText("Check In")).toBeInTheDocument();
  });

  it("navigates to /login and stores redirect path when user is not authenticated", () => {
    mockUseIsAuthenticated.mockReturnValue({ data: { authenticated: false } });

    renderHome();

    const bookingButton = screen.getByText("Book a Campus Tour");
    fireEvent.click(bookingButton);

    // Check that navigation was called with login path
    expect(mockNavigate).toHaveBeenCalledWith("/login");
    // Check that the redirect path was stored
    expect(sessionStorage.getItem("redirectAfterLogin")).toBe("/u?tab=book-tour");
  });

  it("navigates directly to /u?tab=book-tour when user is authenticated", () => {
    mockUseIsAuthenticated.mockReturnValue({ data: { authenticated: true } });

    renderHome();

    const bookingButton = screen.getByText("Book a Campus Tour");
    fireEvent.click(bookingButton);

    // Check that navigation was called with the booking path
    expect(mockNavigate).toHaveBeenCalledWith("/u?tab=book-tour");
    // Check that no redirect path was stored
    expect(sessionStorage.getItem("redirectAfterLogin")).toBe(null);
  });

  it("handles checkin navigation for unauthenticated users", () => {
    mockUseIsAuthenticated.mockReturnValue({ data: { authenticated: false } });

    renderHome();

    const checkinButton = screen.getByText("Check In");
    fireEvent.click(checkinButton);

    // Check that navigation was called with login path
    expect(mockNavigate).toHaveBeenCalledWith("/login");
    // Check that the redirect path was stored
    expect(sessionStorage.getItem("redirectAfterLogin")).toBe("/u?tab=check-in");
  });

  it("handles checkin navigation for authenticated users", () => {
    mockUseIsAuthenticated.mockReturnValue({ data: { authenticated: true } });

    renderHome();

    const checkinButton = screen.getByText("Check In");
    fireEvent.click(checkinButton);

    // Check that navigation was called with the check-in path
    expect(mockNavigate).toHaveBeenCalledWith("/u?tab=check-in");
    // Check that no redirect path was stored
    expect(sessionStorage.getItem("redirectAfterLogin")).toBe(null);
  });

  it("handles undefined authentication state gracefully", () => {
    mockUseIsAuthenticated.mockReturnValue({ data: undefined });

    renderHome();

    const bookingButton = screen.getByText("Book a Campus Tour");
    fireEvent.click(bookingButton);

    // Should default to login when authentication status is undefined
    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(sessionStorage.getItem("redirectAfterLogin")).toBe("/u?tab=book-tour");
  });
});
