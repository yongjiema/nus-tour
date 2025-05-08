import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "../index";
import { useCustom, useApiUrl } from "@refinedev/core";
import { BrowserRouter } from "react-router-dom";

// Define mock types
interface CustomHookReturn {
  data?: any;
  isLoading: boolean;
  error?: any;
  refetch: () => void;
}

// Simpler mock type definitions that work with Vitest
const mockUseCustom = useCustom as unknown as {
  mockImplementation: (fn: (params: { url: string; method?: string }) => CustomHookReturn) => void;
  mockReturnValue: (value: CustomHookReturn) => void;
};

const mockUseApiUrl = useApiUrl as unknown as {
  mockReturnValue: (value: string) => void;
};

// Mock the refine hooks
vi.mock("@refinedev/core", () => ({
  useCustom: vi.fn(),
  useApiUrl: vi.fn(),
}));

// Mock the errorHandler
vi.mock("../../../utils/errorHandler", () => ({
  useErrorHandler: () => ({ handleError: vi.fn() }),
}));

// Mock the date formatter
vi.mock("../../../utils/dateUtils", () => ({
  formatDateDisplay: vi.fn(() => "May 08, 2025"),
}));

describe("AdminDashboard Component", () => {
  const mockStats = {
    totalBookings: 120,
    pendingCheckIns: 25,
    completedTours: 85,
    feedbacks: 50,
  };

  const mockActivities = [
    {
      id: "1",
      type: "booking",
      description: "New booking created",
      timestamp: "2025-05-08T10:30:00Z",
    },
    {
      id: "2",
      type: "feedback",
      description: "New feedback received",
      timestamp: "2025-05-08T09:45:00Z",
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock returns
    mockUseApiUrl.mockReturnValue("http://localhost:3000/api");

    // Mock successful API responses with explicit typing for parameters
    mockUseCustom.mockImplementation((params: { url: string; method?: string }) => {
      if (params.url.includes("/stats")) {
        return {
          data: { data: mockStats },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        };
      } else if (params.url.includes("/recent-activity")) {
        return {
          data: mockActivities,
          isLoading: false,
          refetch: vi.fn(),
        };
      }
      return {
        isLoading: false,
        refetch: vi.fn(),
      };
    });
  });

  it("renders the dashboard title", () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>,
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("displays the statistics cards with correct values", async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>,
    );

    // Wait for the component to render with the data
    await waitFor(() => {
      expect(screen.getByText("Total Bookings")).toBeInTheDocument();
      expect(screen.getByText("120")).toBeInTheDocument();
      expect(screen.getByText("Pending Check-Ins")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("Completed Tours")).toBeInTheDocument();
      expect(screen.getByText("85")).toBeInTheDocument();
      expect(screen.getByText("Feedbacks Received")).toBeInTheDocument();
      expect(screen.getByText("50")).toBeInTheDocument();
    });
  });

  it("displays quick action buttons", () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>,
    );

    expect(screen.getByText("Manage Bookings")).toBeInTheDocument();
    expect(screen.getByText("Manage Check-Ins")).toBeInTheDocument();
    expect(screen.getByText("View Feedback")).toBeInTheDocument();
  });

  it("displays recent activity items", async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>,
    );

    // Wait for the component to render with the data
    await waitFor(() => {
      expect(screen.getByText("New booking created")).toBeInTheDocument();
      expect(screen.getByText("New feedback received")).toBeInTheDocument();
      expect(screen.getAllByText("May 08, 2025")).toHaveLength(2);
    });
  });

  it("shows loading state when data is loading", async () => {
    // Mock loading state
    mockUseCustom.mockImplementation(() => ({
      isLoading: true,
      refetch: vi.fn(),
    }));

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>,
    );

    // Check for the presence of skeletons
    const skeletons = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("handles refresh button click", async () => {
    const mockRefetch = vi.fn();
    const mockRefetchActivity = vi.fn();

    // Mock refetch functions
    mockUseCustom.mockImplementation((params: { url: string; method?: string }) => {
      if (params.url.includes("/stats")) {
        return {
          data: { data: mockStats },
          isLoading: false,
          refetch: mockRefetch,
        };
      } else if (params.url.includes("/recent-activity")) {
        return {
          data: mockActivities,
          isLoading: false,
          refetch: mockRefetchActivity,
        };
      }
      return {
        isLoading: false,
        refetch: vi.fn(),
      };
    });

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>,
    );

    // Click the refresh button
    const refreshButton = screen.getByText("Refresh Data");
    await userEvent.click(refreshButton);

    // Verify refetch functions were called
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(mockRefetchActivity).toHaveBeenCalledTimes(1);
  });
});
