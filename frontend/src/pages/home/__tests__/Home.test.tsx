import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// Use vi.hoisted to properly hoist the mock
const { mockUseIsAuthenticated } = vi.hoisted(() => ({
  mockUseIsAuthenticated: vi.fn(),
}));

vi.mock("@refinedev/core", () => ({
  useIsAuthenticated: mockUseIsAuthenticated,
}));

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
  });

  it("renders all main elements", () => {
    mockUseIsAuthenticated.mockReturnValue({ data: false });

    renderHome();

    expect(screen.getByText("Welcome to NUS Tour")).toBeInTheDocument();
    expect(screen.getByText("Learn More About NUS")).toBeInTheDocument();
    expect(screen.getByText("Book a Campus Tour")).toBeInTheDocument();
    expect(screen.getByText("Check In")).toBeInTheDocument();
  });

  it("navigates to /register when user is not authenticated", () => {
    mockUseIsAuthenticated.mockReturnValue({ data: false });

    renderHome();

    const bookingButton = screen.getByText("Book a Campus Tour");
    expect(bookingButton.closest("a")).toHaveAttribute("href", "/register");
  });

  it("navigates to /booking when user is authenticated", () => {
    mockUseIsAuthenticated.mockReturnValue({ data: true });

    renderHome();

    const bookingButton = screen.getByText("Book a Campus Tour");
    expect(bookingButton.closest("a")).toHaveAttribute("href", "/booking");
  });

  it("handles undefined authentication state gracefully", () => {
    mockUseIsAuthenticated.mockReturnValue({ data: undefined });

    renderHome();

    const bookingButton = screen.getByText("Book a Campus Tour");
    // Should default to register when authentication status is undefined
    expect(bookingButton.closest("a")).toHaveAttribute("href", "/register");
  });
});
