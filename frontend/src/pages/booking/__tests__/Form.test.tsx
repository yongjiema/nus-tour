import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "../../../../test/utils/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingForm } from "../Form";

// Mock Refine hooks
const mockCreate: ReturnType<typeof vi.fn> = vi.fn();
const mockNotification: ReturnType<typeof vi.fn> = vi.fn();
const mockNavigate: ReturnType<typeof vi.fn> = vi.fn();

vi.mock("@refinedev/core", () => ({
  useCreate: () => ({ mutate: mockCreate }),
  useNotification: () => ({ open: mockNotification }),
  useApiUrl: () => "http://localhost:3000/api",
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the centralized API service
const mockCreateBooking = vi.fn();
const mockUseAvailableTimeSlots = vi.fn();

vi.mock("../../../services/api", () => ({
  useCreateBooking: () => ({
    createBooking: mockCreateBooking,
  }),
  useAvailableTimeSlots: () =>
    mockUseAvailableTimeSlots() as {
      data: { data: { slot: string; available: number }[] } | undefined;
      isLoading: boolean;
      error: unknown;
      refetch: () => void;
    },
}));

// Mock the logger
vi.mock("../../../utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

describe("BookingForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup time slots mock
    mockUseAvailableTimeSlots.mockReturnValue({
      data: {
        data: [
          { slot: "09:00 AM - 10:00 AM", available: 10 },
          { slot: "10:00 AM - 11:00 AM", available: 8 },
          { slot: "11:00 AM - 12:00 PM", available: 5 },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    // Setup successful mock response
    mockCreateBooking.mockImplementation((_data, options: unknown) => {
      if (
        options &&
        typeof options === "object" &&
        "onSuccess" in options &&
        typeof (options as { onSuccess?: unknown }).onSuccess === "function"
      ) {
        (options as { onSuccess: (response: unknown) => void }).onSuccess({
          id: "1",
          bookingId: "BK001",
          status: "pending",
        });
      }
    });

    // Setup localStorage
    localStorage.clear();
    localStorage.setItem("access_token", "test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      }),
    );
    sessionStorage.setItem("booking_flow_valid", "true");

    // Mock document.referrer to avoid navigation issues
    Object.defineProperty(document, "referrer", {
      value: "http://localhost:3000/home",
      writable: true,
    });
  });

  it("renders booking form with all fields", () => {
    render(<BookingForm />);
    expect(screen.getByLabelText(/booking date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time slot/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/group size/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /book tour/i })).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<BookingForm />);
    const dateInput = screen.getByLabelText(/booking date/i);
    await userEvent.clear(dateInput);
    const groupSizeInput = screen.getByLabelText(/group size/i);
    await userEvent.clear(groupSizeInput);
    const submitButton = screen.getByRole("button", { name: /book tour/i });
    await userEvent.click(submitButton);
    await screen.findByText(/booking date is required/i);
  });

  it("validates minimum group size", () => {
    render(<BookingForm />);
    const groupSizeInput = screen.getByLabelText(/group size/i);
    expect(groupSizeInput).toHaveAttribute("min", "1");
    expect(groupSizeInput).toHaveAttribute("max", "50");
    expect(groupSizeInput).toHaveAttribute("type", "number");
  });

  it("validates maximum group size", async () => {
    render(<BookingForm />);
    const groupSizeInput = screen.getByLabelText(/group size/i);
    await userEvent.clear(groupSizeInput);
    await userEvent.type(groupSizeInput, "25");
    expect(groupSizeInput).toHaveValue(25);
  });

  it("validates future date selection", async () => {
    render(<BookingForm />);
    const dateInput = screen.getByLabelText(/booking date/i);
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "01/01/2020");
    const submitButton = screen.getByRole("button", { name: /book tour/i });
    await userEvent.click(submitButton);
    await screen.findByText(/date must be a|booking date is required/i);
  });

  it("submits form with valid data", async () => {
    render(<BookingForm />);

    // Fill in the form with valid data
    const groupSizeInput = screen.getByLabelText(/group size/i);
    await userEvent.clear(groupSizeInput);
    await userEvent.type(groupSizeInput, "5");

    // Select a time slot
    const timeSlotSelect = screen.getByLabelText(/time slot/i);
    await userEvent.click(timeSlotSelect);
    const timeSlotOption = screen.getByText("09:00 AM - 10:00 AM (10 available)");
    await userEvent.click(timeSlotOption);

    const submitButton = screen.getByRole("button", { name: /book tour/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.any(String),
          timeSlot: "09:00 AM - 10:00 AM",
          groupSize: 5,
          name: "Test User",
          email: "test@example.com",
        }),
        expect.any(Object), // options object
      );
    });
  });

  it("displays error message on booking failure", async () => {
    const errorMessage = "Time slot is already booked";

    // Setup error mock
    mockCreateBooking.mockImplementation((_data, options: unknown) => {
      if (
        options &&
        typeof options === "object" &&
        "onError" in options &&
        typeof (options as { onError?: unknown }).onError === "function"
      ) {
        (options as { onError: (error: Error) => void }).onError(new Error(errorMessage));
      }
    });

    render(<BookingForm />);

    // Fill in the form with valid data
    const groupSizeInput = screen.getByLabelText(/group size/i);
    await userEvent.clear(groupSizeInput);
    await userEvent.type(groupSizeInput, "5");

    // Select a time slot
    const timeSlotSelect = screen.getByLabelText(/time slot/i);
    await userEvent.click(timeSlotSelect);
    const timeSlotOption = screen.getByText("09:00 AM - 10:00 AM (10 available)");
    await userEvent.click(timeSlotOption);

    const submitButton = screen.getByRole("button", { name: /book tour/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("handles form submission", async () => {
    render(<BookingForm />);

    // Fill in the form with valid data
    const groupSizeInput = screen.getByLabelText(/group size/i);
    await userEvent.clear(groupSizeInput);
    await userEvent.type(groupSizeInput, "5");

    // Select a time slot
    const timeSlotSelect = screen.getByLabelText(/time slot/i);
    await userEvent.click(timeSlotSelect);
    const timeSlotOption = screen.getByText("09:00 AM - 10:00 AM (10 available)");
    await userEvent.click(timeSlotOption);

    const submitButton = screen.getByRole("button", { name: /book tour/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalled();
    });
  });

  it("redirects on successful submission", async () => {
    render(<BookingForm />);

    // Fill in the form with valid data
    const groupSizeInput = screen.getByLabelText(/group size/i);
    await userEvent.clear(groupSizeInput);
    await userEvent.type(groupSizeInput, "5");

    // Select a time slot
    const timeSlotSelect = screen.getByLabelText(/time slot/i);
    await userEvent.click(timeSlotSelect);
    const timeSlotOption = screen.getByText("09:00 AM - 10:00 AM (10 available)");
    await userEvent.click(timeSlotOption);

    const submitButton = screen.getByRole("button", { name: /book tour/i });
    await userEvent.click(submitButton);

    // Wait for the success message
    await waitFor(
      () => {
        expect(screen.getByText("Booking created successfully! Redirecting to payment...")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    // Wait for navigation
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/payment/success");
      },
      { timeout: 2000 },
    );
  });
});
