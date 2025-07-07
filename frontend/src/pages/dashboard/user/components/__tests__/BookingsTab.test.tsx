import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookingsTab } from "../BookingsTab";
import { BookingStatus } from "../../../../../types/enums";
import type { Booking } from "../../../../../types/api.types";
import { AllTheProviders } from "../../../../../../test/utils/test-utils";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Refine hooks
const mockOpen = vi.fn();
const mockMutate = vi.fn();

vi.mock("@refinedev/core", () => ({
  useNotification: () => ({ open: mockOpen }),
  useCustomMutation: () => ({ mutate: mockMutate, isPending: false }),
}));

// Mock theme hook
vi.mock("@mui/material/styles", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mui/material/styles")>();
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        primary: { main: "#1976d2" },
        text: { secondary: "#666" },
      },
    }),
  };
});

// Mock dashboard components
vi.mock("../../../../../components/dashboard", () => ({
  DashboardCard: ({ children, sx }: { children: React.ReactNode; sx?: React.CSSProperties }) => (
    <div data-testid="dashboard-card" style={sx}>
      {children}
    </div>
  ),
  StatusChip: ({ label, color }: { label: string; color: string }) => (
    <span data-testid="status-chip" data-color={color}>
      {label}
    </span>
  ),
  ActionButton: ({
    children,
    onClick,
    disabled,
    variant,
    color,
    size,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    color?: string;
    size?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="action-button"
      data-variant={variant}
      data-color={color}
      data-size={size}
    >
      {children}
    </button>
  ),
  DestructiveButton: ({
    children,
    onClick,
    disabled,
    variant,
    size,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="destructive-button"
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
  EmptyStateContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-state">{children}</div>,
  CardContent: ({ children, sx }: { children: React.ReactNode; sx?: React.CSSProperties }) => (
    <div data-testid="card-content" style={sx}>
      {children}
    </div>
  ),
}));

// Mock theme constants
vi.mock("../../../../../theme/constants", () => ({
  getElevatedShadow: () => "0 4px 8px rgba(0,0,0,0.1)",
}));

describe("BookingsTab", () => {
  const mockOnFeedbackClick = vi.fn();

  const createMockBooking = (overrides: Partial<Booking> = {}): Booking => ({
    id: "1",
    bookingId: "1",
    name: "Test User",
    email: "test@example.com",
    date: "2024-12-25",
    timeSlot: "09:00 - 10:00",
    groupSize: 5,
    status: BookingStatus.CONFIRMED,
    bookingStatus: BookingStatus.CONFIRMED,
    checkedIn: false,
    hasFeedback: false,
    createdAt: new Date(),
    deposit: 50,
    expiresAt: undefined,
    ...overrides,
  });

  const renderComponent = (props: Partial<Parameters<typeof BookingsTab>[0]> = {}) => {
    const defaultProps = {
      bookings: [],
      isLoading: false,
      isError: false,
      onFeedbackClick: mockOnFeedbackClick,
      ...props,
    };

    return render(
      <AllTheProviders>
        <BookingsTab {...defaultProps} />
      </AllTheProviders>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading and Error States", () => {
    it("should show loading spinner when isLoading is true", () => {
      renderComponent({ isLoading: true });
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should show error message when isError is true", () => {
      renderComponent({ isError: true });
      expect(screen.getByText("Failed to load your bookings. Please try refreshing the page.")).toBeInTheDocument();
    });

    it("should show empty state when no bookings exist", () => {
      renderComponent({ bookings: [] });
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No Bookings Yet")).toBeInTheDocument();
    });
  });

  describe("Booking Display", () => {
    it("should render booking cards with consistent height", () => {
      const bookings = [
        createMockBooking({ status: BookingStatus.CONFIRMED }),
        createMockBooking({ id: "2", status: BookingStatus.CANCELLED }),
        createMockBooking({ id: "3", status: BookingStatus.COMPLETED }),
      ];

      renderComponent({ bookings });

      const cards = screen.getAllByTestId("dashboard-card");
      expect(cards).toHaveLength(3);

      // All cards should have height: "100%" style
      cards.forEach((card) => {
        expect(card.style.height).toBe("100%");
      });
    });

    it("should display booking information consistently", () => {
      const booking = createMockBooking();
      renderComponent({ bookings: [booking] });

      expect(screen.getByText("Wed, Dec 25, 2024")).toBeInTheDocument();
      expect(screen.getByText("Time: 09:00 - 10:00")).toBeInTheDocument();
      expect(screen.getByText("Group Size: 5")).toBeInTheDocument();
    });

    it("should show appropriate status for different booking states", () => {
      const bookings = [
        createMockBooking({ status: BookingStatus.SLOT_RESERVED }),
        createMockBooking({ id: "2", status: BookingStatus.CONFIRMED }),
        createMockBooking({ id: "3", status: BookingStatus.COMPLETED }),
      ];

      renderComponent({ bookings });

      // Use getAllByText and check the count
      const paymentRequiredElements = screen.getAllByText("Payment Required");
      expect(paymentRequiredElements).toHaveLength(2); // One in filter, one in status chip

      const confirmedElements = screen.getAllByText("Confirmed");
      expect(confirmedElements).toHaveLength(2); // One in filter, one in status chip

      const completedElements = screen.getAllByText("Completed");
      expect(completedElements).toHaveLength(2); // One in filter, one in status chip
    });
  });

  describe("Cancel Functionality", () => {
    it("should show cancel button for cancellable bookings", () => {
      const booking = createMockBooking({ status: BookingStatus.CONFIRMED });
      renderComponent({ bookings: [booking] });

      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).not.toBeDisabled();
    });

    it("should show confirmation dialog when cancel is clicked", () => {
      const booking = createMockBooking({ status: BookingStatus.CONFIRMED });
      renderComponent({ bookings: [booking] });

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Cancel Booking" })).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to cancel this booking\? This action cannot be undone\./),
      ).toBeInTheDocument();
    });

    it("should call cancel mutation when confirmed", async () => {
      const booking = createMockBooking({ status: BookingStatus.CONFIRMED });
      renderComponent({ bookings: [booking] });

      // Click cancel button
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      // Confirm cancellation - use the button in the dialog
      const confirmButton = screen.getByRole("button", { name: "Cancel Booking" });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          {
            url: "bookings/1",
            method: "delete",
            values: {},
            successNotification: false,
            errorNotification: false,
          },
          expect.any(Object),
        );
      });
    });

    it("should not show cancel button for non-cancellable bookings", () => {
      const booking = createMockBooking({ status: BookingStatus.COMPLETED });
      renderComponent({ bookings: [booking] });

      expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    });
  });

  describe("Payment Functionality", () => {
    it("should show payment button for reservations requiring payment", () => {
      const booking = createMockBooking({ status: BookingStatus.SLOT_RESERVED });
      renderComponent({ bookings: [booking] });

      expect(screen.getByText("Pay it now")).toBeInTheDocument();
    });

    it("should navigate to payment tab when payment button is clicked", () => {
      const booking = createMockBooking({ status: BookingStatus.SLOT_RESERVED });
      renderComponent({ bookings: [booking] });

      const paymentButton = screen.getByText("Pay it now");
      fireEvent.click(paymentButton);

      expect(mockNavigate).toHaveBeenCalledWith("/u?tab=payment&id=1");
    });
  });

  describe("Search and Filter", () => {
    it("should filter bookings based on search term", () => {
      const bookings = [
        createMockBooking({ date: "2024-12-25" }),
        createMockBooking({ id: "2", date: "2024-12-26", timeSlot: "14:00 - 15:00" }),
      ];

      renderComponent({ bookings });

      const searchInput = screen.getByPlaceholderText("Search bookings...");
      fireEvent.change(searchInput, { target: { value: "14:00" } });

      expect(screen.getByText("Thu, Dec 26, 2024")).toBeInTheDocument();
      expect(screen.queryByText("Wed, Dec 25, 2024")).not.toBeInTheDocument();
    });

    it("should show filter chips for different statuses", () => {
      const bookings = [
        createMockBooking({ status: BookingStatus.CONFIRMED }),
        createMockBooking({ id: "2", status: BookingStatus.COMPLETED }),
      ];

      renderComponent({ bookings });

      expect(screen.getByText("All")).toBeInTheDocument();
      // Use getAllByText to handle multiple elements with the same text
      const confirmedElements = screen.getAllByText("Confirmed");
      expect(confirmedElements.length).toBeGreaterThan(0);
      const completedElements = screen.getAllByText("Completed");
      expect(completedElements.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for dialog", () => {
      const booking = createMockBooking({ status: BookingStatus.CONFIRMED });
      renderComponent({ bookings: [booking] });

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "cancel-dialog-title");
      expect(dialog).toHaveAttribute("aria-describedby", "cancel-dialog-description");
    });
  });
});
