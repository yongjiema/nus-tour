import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import PrivateRoute from "../index";
import { UserRole } from "../../../types/auth.types";

const { mockUseIsAuthenticated } = vi.hoisted(() => ({
  mockUseIsAuthenticated: vi.fn(),
}));

vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...actual,
    useIsAuthenticated: mockUseIsAuthenticated,
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) =>
      React.createElement("div", { "data-testid": "redirect" }, `Redirecting to ${to}`),
    Outlet: () => React.createElement("div", { "data-testid": "outlet" }, "Protected Content Outlet"),
  };
});

describe("PrivateRoute Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state while authentication is being checked", () => {
    mockUseIsAuthenticated.mockReturnValue({
      isLoading: true,
      data: undefined,
    });
    render(<PrivateRoute />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders outlet when user is authenticated without role requirements", async () => {
    mockUseIsAuthenticated.mockReturnValue({
      isLoading: false,
      data: true,
    });
    await act(async () => {
      render(<PrivateRoute />);
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });
  });

  it("redirects to login when user is not authenticated", async () => {
    mockUseIsAuthenticated.mockReturnValue({
      isLoading: false,
      data: false,
    });
    await act(async () => {
      render(<PrivateRoute />);
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(screen.getByTestId("redirect")).toBeInTheDocument();
      expect(screen.getByText("Redirecting to /login")).toBeInTheDocument();
    });
  });

  it("handles role-specific access requirements", async () => {
    mockUseIsAuthenticated.mockReturnValue({
      isLoading: false,
      data: true,
    });
    await act(async () => {
      render(<PrivateRoute requiredRole={UserRole.ADMIN} />);
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(screen.getByTestId("redirect")).toBeInTheDocument();
    });
  });
});
