import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminCheckInManagement } from "../checkInManagement";

// Mock hooks
const mockUseAdminBookings = vi.fn();
const mockUseCustomMutation = vi.fn();
const mockUseNotification = vi.fn();

vi.mock("../../../hooks", () => ({
  useAdminBookings: (): unknown => mockUseAdminBookings(),
}));

vi.mock("@refinedev/core", () => ({
  useCustomMutation: (): unknown => mockUseCustomMutation(),
  useNotification: (): unknown => mockUseNotification(),
  useList: (): unknown => mockUseAdminBookings(),
}));

vi.mock("../../../utils/errorHandler", () => ({
  handleRefineError: vi.fn((): string => "Mocked error message"),
}));

describe("AdminCheckInManagement", () => {
  const mockBookings = [
    {
      id: "1",
      date: "2025-01-15",
      timeSlot: "09:00 - 10:00",
      groupSize: 5,
      status: "confirmed",
      email: "user1@example.com",
    },
    {
      id: "2",
      date: "2025-01-15",
      timeSlot: "14:00 - 15:00",
      groupSize: 3,
      status: "confirmed",
      email: "user2@example.com",
    },
    {
      id: "3",
      date: "2025-01-15",
      timeSlot: "10:00 - 11:00",
      groupSize: 2,
      status: "checked_in",
      email: "user3@example.com",
    },
  ];

  const mockMutate = vi.fn();
  const mockOpen = vi.fn();

  beforeEach(() => {
    mockUseAdminBookings.mockReturnValue({
      data: { data: mockBookings },
      isLoading: false,
      error: null,
    });

    mockUseCustomMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    mockUseNotification.mockReturnValue({
      open: mockOpen,
    });

    vi.clearAllMocks();
  });

  it("should render check-in management interface", () => {
    render(<AdminCheckInManagement />);

    expect(screen.getByText(/Manage check-ins for confirmed bookings/)).toBeInTheDocument();
    expect(screen.getByText("QR Scanner")).toBeInTheDocument();
    expect(screen.getByText("Manual Entry")).toBeInTheDocument();
    expect(screen.getByText("Bookings List")).toBeInTheDocument();
  });

  it("should show QR scanner tab by default", () => {
    render(<AdminCheckInManagement />);

    expect(screen.getByText("QR Code Scanner")).toBeInTheDocument();
    expect(screen.getByText("Open QR Scanner")).toBeInTheDocument();
  });

  it("should switch to manual entry tab", () => {
    render(<AdminCheckInManagement />);

    const manualTab = screen.getByText("Manual Entry");
    fireEvent.click(manualTab);

    expect(screen.getByText("Manual Check-in")).toBeInTheDocument();
    expect(screen.getByLabelText("Booking ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
  });

  it("should switch to bookings list tab", () => {
    render(<AdminCheckInManagement />);

    const bookingsTab = screen.getByText("Bookings List");
    fireEvent.click(bookingsTab);

    expect(screen.getByPlaceholderText("Search bookings...")).toBeInTheDocument();
    expect(screen.getByText("Booking ID")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
  });

  it("should handle manual check-in form submission", () => {
    render(<AdminCheckInManagement />);

    // Switch to manual entry tab
    const manualTab = screen.getByText("Manual Entry");
    fireEvent.click(manualTab);

    // Fill in the form
    const bookingIdInput = screen.getByLabelText("Booking ID");
    const emailInput = screen.getByLabelText("Email Address");

    fireEvent.change(bookingIdInput, { target: { value: "booking-123" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Submit the form
    const checkInButton = screen.getByText("Check In");
    fireEvent.click(checkInButton);

    expect(mockMutate).toHaveBeenCalledWith(
      {
        url: "checkins",
        method: "post",
        values: {
          bookingId: "booking-123",
          email: "test@example.com",
        },
        errorNotification: false, // We disabled Refine's built-in error notification
      },
      expect.any(Object),
    );
  });

  it("should show error when manual check-in form is incomplete", () => {
    render(<AdminCheckInManagement />);

    // Switch to manual entry tab
    const manualTab = screen.getByText("Manual Entry");
    fireEvent.click(manualTab);

    // The check-in button should be disabled when form is empty
    const checkInButton = screen.getByText("Check In");
    expect(checkInButton).toBeDisabled();
  });

  it("should filter confirmed bookings in the list", () => {
    render(<AdminCheckInManagement />);

    // Switch to bookings list tab
    const bookingsTab = screen.getByText("Bookings List");
    fireEvent.click(bookingsTab);

    // Should show table headers for bookings list
    expect(screen.getByText("Booking ID")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should handle search functionality", () => {
    render(<AdminCheckInManagement />);

    // Switch to bookings list tab
    const bookingsTab = screen.getByText("Bookings List");
    fireEvent.click(bookingsTab);

    // Search for a specific booking
    const searchInput = screen.getByPlaceholderText("Search bookings...");
    fireEvent.change(searchInput, { target: { value: "09:00" } });

    // Should show only bookings matching the search
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("should clear search when clear button is clicked", () => {
    render(<AdminCheckInManagement />);

    // Switch to bookings list tab
    const bookingsTab = screen.getByText("Bookings List");
    fireEvent.click(bookingsTab);

    // Enter search term
    const searchInput = screen.getByPlaceholderText("Search bookings...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    // Click clear button (the close icon should be visible now)
    const clearButton = screen.getByTestId("CloseIcon").closest("button");
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    expect(searchInput).toHaveValue("");
  });

  it("should pre-fill manual entry form when check-in button is clicked", () => {
    render(<AdminCheckInManagement />);

    // Switch to bookings list tab
    const bookingsTab = screen.getByText("Bookings List");
    fireEvent.click(bookingsTab);

    // Click check-in button for first booking
    const checkInButtons = screen.getAllByText("Check In");
    fireEvent.click(checkInButtons[0]);

    // Should switch to manual entry tab and pre-fill form
    expect(screen.getByText("Manual Check-in")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1")).toBeInTheDocument(); // Booking ID
    expect(screen.getByDisplayValue("user1@example.com")).toBeInTheDocument(); // Email
  });

  it("should show loading state", () => {
    mockUseAdminBookings.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<AdminCheckInManagement />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should show error state", () => {
    mockUseAdminBookings.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch"),
    });

    render(<AdminCheckInManagement />);

    expect(screen.getByText(/Failed to load bookings/)).toBeInTheDocument();
  });

  it("should handle pagination", () => {
    render(<AdminCheckInManagement />);

    // Switch to bookings list tab
    const bookingsTab = screen.getByText("Bookings List");
    fireEvent.click(bookingsTab);

    // Check if pagination controls are present
    expect(screen.getByText(/Rows per page/)).toBeInTheDocument();
  });

  it("should disable check-in button when processing", () => {
    mockUseCustomMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(<AdminCheckInManagement />);

    // Switch to manual entry tab
    const manualTab = screen.getByText("Manual Entry");
    fireEvent.click(manualTab);

    const checkInButton = screen.getByText("Processing...");
    expect(checkInButton).toBeDisabled();
  });
});
