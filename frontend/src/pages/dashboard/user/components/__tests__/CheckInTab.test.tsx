import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CheckInTab } from "../CheckInTab";
import { BookingStatus } from "../../../../../types/enums";
import type { Booking } from "../../../../../types/api.types";

// Mock useGetIdentity hook
const mockUseGetIdentity = vi.fn();
vi.mock("@refinedev/core", () => ({
  useGetIdentity: (): unknown => mockUseGetIdentity(),
}));

// Mock QRCode library
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve("data:image/png;base64,mocked-qr-code")),
  },
}));

describe("CheckInTab", () => {
  const mockUser = {
    id: "1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
  };

  const createMockBooking = (overrides: Partial<Booking> = {}): Booking => ({
    id: "1",
    bookingId: "1",
    name: "Test User",
    email: "test@example.com",
    date: new Date().toISOString().split("T")[0], // Today's date
    timeSlot: "09:00 - 10:00",
    groupSize: 5,
    status: BookingStatus.CONFIRMED,
    bookingStatus: BookingStatus.CONFIRMED,
    checkedIn: false,
    hasFeedback: false,
    createdAt: new Date(),
    deposit: 50,
    ...overrides,
  });

  beforeEach(() => {
    mockUseGetIdentity.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });
  });

  it("should render empty state when no eligible bookings", () => {
    render(<CheckInTab bookings={[]} isLoading={false} isError={false} />);

    expect(screen.getByText("No Check-in Available")).toBeInTheDocument();
    expect(screen.getByText(/You don't have any confirmed bookings/)).toBeInTheDocument();
  });

  it("should render loading state", () => {
    render(<CheckInTab bookings={[]} isLoading={true} isError={false} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should render error state", () => {
    render(<CheckInTab bookings={[]} isLoading={false} isError={true} />);

    expect(screen.getByText(/Failed to load bookings/)).toBeInTheDocument();
  });

  it("should display confirmed bookings available for check-in", () => {
    const confirmedBooking = createMockBooking({
      status: BookingStatus.CONFIRMED,
    });

    render(<CheckInTab bookings={[confirmedBooking]} isLoading={false} isError={false} />);

    expect(screen.getByText("Check-in for Your Tours")).toBeInTheDocument();
    expect(screen.getByText("Booking #1")).toBeInTheDocument();
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText("Generate QR Code")).toBeInTheDocument();
  });

  it("should display already checked-in bookings with completed status", () => {
    const checkedInBooking = createMockBooking({
      status: BookingStatus.CHECKED_IN,
    });

    render(<CheckInTab bookings={[checkedInBooking]} isLoading={false} isError={false} />);

    expect(screen.getByText("Booking #1")).toBeInTheDocument();
    expect(screen.getByText("CHECKED IN")).toBeInTheDocument();
  });

  it("should open QR code dialog when booking is clicked", async () => {
    const confirmedBooking = createMockBooking({
      status: BookingStatus.CONFIRMED,
    });

    render(<CheckInTab bookings={[confirmedBooking]} isLoading={false} isError={false} />);

    // Click on the booking card
    const bookingCard =
      screen.getByText("Booking #1").closest('div[role="button"]') ??
      screen.getByText("Generate QR Code").closest("button");

    if (bookingCard) {
      fireEvent.click(bookingCard);
    }

    await waitFor(() => {
      expect(screen.getByText("Check-in QR Code")).toBeInTheDocument();
    });
  });

  it("should display booking details in QR dialog", async () => {
    const confirmedBooking = createMockBooking({
      status: BookingStatus.CONFIRMED,
      date: "2025-01-15",
      timeSlot: "14:00 - 15:00",
      groupSize: 3,
    });

    render(<CheckInTab bookings={[confirmedBooking]} isLoading={false} isError={false} />);

    // Open dialog
    const generateButton = screen.getByText("Generate QR Code");
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("Booking Details")).toBeInTheDocument();
      expect(screen.getByText("Booking ID:")).toBeInTheDocument();
      expect(screen.getAllByText("1")[0]).toBeInTheDocument(); // First occurrence is in dialog
      expect(screen.getByText("Time:")).toBeInTheDocument();
      expect(screen.getAllByText("14:00 - 15:00")[1]).toBeInTheDocument(); // Second occurrence is in dialog
      expect(screen.getByText("Group Size:")).toBeInTheDocument();
      expect(screen.getAllByText("3")[0]).toBeInTheDocument(); // Booking ID 3
      expect(screen.getByText("Email:")).toBeInTheDocument();
      expect(screen.getAllByText("test@example.com")[0]).toBeInTheDocument();
    });
  });

  it("should show manual check-in information in dialog", async () => {
    const confirmedBooking = createMockBooking({
      status: BookingStatus.CONFIRMED,
    });

    render(<CheckInTab bookings={[confirmedBooking]} isLoading={false} isError={false} />);

    // Open dialog
    const generateButton = screen.getByText("Generate QR Code");
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("For Manual Check-in:")).toBeInTheDocument();
      expect(screen.getByText("Booking ID:")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("Email:")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("should mark today bookings with TODAY chip", () => {
    const todayBooking = createMockBooking({
      status: BookingStatus.CONFIRMED,
      date: new Date().toISOString().split("T")[0], // Today
    });

    render(<CheckInTab bookings={[todayBooking]} isLoading={false} isError={false} />);

    expect(screen.getByText("TODAY")).toBeInTheDocument();
  });

  it("should filter out non-eligible bookings", () => {
    const bookings = [
      createMockBooking({ id: "1", status: BookingStatus.CONFIRMED }), // Should show
      createMockBooking({ id: "2", status: BookingStatus.CHECKED_IN }), // Should show
      createMockBooking({ id: "3", status: BookingStatus.AWAITING_PAYMENT }), // Should not show
      createMockBooking({ id: "4", status: BookingStatus.CANCELLED }), // Should not show
    ];

    render(<CheckInTab bookings={bookings} isLoading={false} isError={false} />);

    // Should only show 2 bookings (confirmed and checked_in)
    const bookingCards = screen.getAllByText(/Booking #/);
    expect(bookingCards).toHaveLength(2);
  });

  it("should close dialog when close button is clicked", async () => {
    const confirmedBooking = createMockBooking({
      status: BookingStatus.CONFIRMED,
    });

    render(<CheckInTab bookings={[confirmedBooking]} isLoading={false} isError={false} />);

    // Open dialog
    const generateButton = screen.getByText("Generate QR Code");
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("Check-in QR Code")).toBeInTheDocument();
    });

    // Close dialog
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Check-in QR Code")).not.toBeInTheDocument();
    });
  });

  it("should disable generate QR button for completed bookings", () => {
    const completedBooking = createMockBooking({
      status: BookingStatus.COMPLETED,
    });

    render(<CheckInTab bookings={[completedBooking]} isLoading={false} isError={false} />);

    // Completed bookings should show the button as disabled with "Completed" text
    const completedButton = screen.getByRole("button", { name: /completed/i });
    expect(completedButton).toBeDisabled();
  });
});
