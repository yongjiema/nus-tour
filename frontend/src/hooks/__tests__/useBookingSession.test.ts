import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBookingSession } from "../useBookingSession";
import { AllTheProviders } from "../../../test/utils/test-utils";
import type { ReservationData } from "../useBookingSession";

// Mock the useReservation hook
const mockCancelReservationAPI = vi.fn();
vi.mock("../useReservation", () => ({
  useCancelReservation: () => ({
    mutate: mockCancelReservationAPI,
    isPending: false,
  }),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
});

describe("useBookingSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("Loading from localStorage", () => {
    it("should load valid reservation from localStorage", () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);

      const reservationData = {
        bookingId: "123",
        expiresAt: futureDate.toISOString(),
        groupSize: 5,
        date: "2024-12-25",
        timeSlot: "09:00 - 10:00",
        deposit: 50,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(reservationData));

      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      expect(result.current.reservation).toEqual(reservationData);
      expect(result.current.timeRemaining).toBeGreaterThan(0);
      expect(result.current.isExpired).toBe(false);
    });

    it("should remove expired reservation from localStorage", () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);

      const expiredReservation = {
        bookingId: "123",
        expiresAt: pastDate.toISOString(),
        groupSize: 5,
        date: "2024-12-25",
        timeSlot: "09:00 - 10:00",
        deposit: 50,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredReservation));

      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      expect(result.current.reservation).toBeNull();
      expect(result.current.isExpired).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("booking_reservation");
    });

    it("should handle invalid JSON in localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid json");

      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      expect(result.current.reservation).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("booking_reservation");
    });
  });

  describe("Countdown Timer", () => {
    it("should countdown time remaining", () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);

      const reservationData = {
        bookingId: "123",
        expiresAt: futureDate.toISOString(),
        groupSize: 5,
        date: "2024-12-25",
        timeSlot: "09:00 - 10:00",
        deposit: 50,
      };

      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      act(() => {
        result.current.saveReservation(reservationData);
      });

      const initialTime = result.current.timeRemaining;

      // Advance timer by 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeRemaining).toBe(initialTime - 2);
      expect(result.current.isExpired).toBe(false);
    });

    it("should expire reservation when countdown reaches zero", () => {
      const nearFutureDate = new Date();
      nearFutureDate.setSeconds(nearFutureDate.getSeconds() + 2);

      const reservationData = {
        bookingId: "123",
        expiresAt: nearFutureDate.toISOString(),
        groupSize: 5,
        date: "2024-12-25",
        timeSlot: "09:00 - 10:00",
        deposit: 50,
      };

      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      act(() => {
        result.current.saveReservation(reservationData);
      });

      // Advance timer beyond expiration
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isExpired).toBe(true);
      expect(result.current.reservation).toBeNull();
    });

    it("should restart timer when reservation changes", () => {
      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      // First reservation
      const futureDate1 = new Date();
      futureDate1.setMinutes(futureDate1.getMinutes() + 5);

      act(() => {
        result.current.saveReservation({
          bookingId: "123",
          expiresAt: futureDate1.toISOString(),
          groupSize: 5,
          date: "2024-12-25",
          timeSlot: "09:00 - 10:00",
          deposit: 50,
        });
      });

      const firstTime = result.current.timeRemaining;

      // Second reservation with more time
      const futureDate2 = new Date();
      futureDate2.setMinutes(futureDate2.getMinutes() + 15);

      act(() => {
        result.current.saveReservation({
          bookingId: "456",
          expiresAt: futureDate2.toISOString(),
          groupSize: 3,
          date: "2024-12-26",
          timeSlot: "14:00 - 15:00",
          deposit: 50,
        });
      });

      expect(result.current.timeRemaining).toBeGreaterThan(firstTime);
      expect(result.current.reservation?.bookingId).toBe("456");
    });
  });

  describe("saveReservation", () => {
    it("should save reservation to localStorage and state", () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);

      const reservationData = {
        bookingId: "123",
        expiresAt: "",
        groupSize: 5,
        date: "2024-12-25",
        timeSlot: "09:00 - 10:00",
        deposit: 50,
      };

      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      act(() => {
        result.current.saveReservation(reservationData);
      });

      // The hook should create a new expiresAt when it's empty, so we check that localStorage was called
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "booking_reservation",
        expect.stringContaining('"bookingId":"123"'),
      );
      expect(result.current.reservation?.expiresAt).toBeTruthy();
      expect(result.current.reservation?.bookingId).toBe("123");
    });

    it("should handle null expiresAt by creating new expiration time", () => {
      const reservationData: ReservationData = {
        bookingId: "123",
        expiresAt: null,
        groupSize: 5,
        date: "2024-12-25",
        timeSlot: "09:00 - 10:00",
        deposit: 50,
      };

      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      act(() => {
        result.current.saveReservation(reservationData);
      });

      expect(result.current.reservation?.expiresAt).toBeTruthy();
      expect(result.current.timeRemaining).toBeGreaterThan(0);
    });
  });

  describe("clearReservation", () => {
    it("should clear reservation without calling backend by default", () => {
      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      // First set a reservation
      act(() => {
        result.current.saveReservation({
          bookingId: "123",
          expiresAt: new Date(Date.now() + 600000).toISOString(),
          groupSize: 5,
          date: "2024-12-25",
          timeSlot: "09:00 - 10:00",
          deposit: 50,
        });
      });

      act(() => {
        result.current.clearReservation();
      });

      expect(result.current.reservation).toBeNull();
      expect(result.current.timeRemaining).toBe(0);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("booking_reservation");
      expect(mockCancelReservationAPI).not.toHaveBeenCalled();
    });

    it("should call backend when callBackend is true", () => {
      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      // First set a reservation
      act(() => {
        result.current.saveReservation({
          bookingId: "123",
          expiresAt: new Date(Date.now() + 600000).toISOString(),
          groupSize: 5,
          date: "2024-12-25",
          timeSlot: "09:00 - 10:00",
          deposit: 50,
        });
      });

      act(() => {
        result.current.clearReservation(true);
      });

      expect(mockCancelReservationAPI).toHaveBeenCalledWith("123", expect.any(Object));
    });
  });

  describe("extendReservation", () => {
    it("should extend reservation time", () => {
      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      // Set initial reservation
      act(() => {
        result.current.saveReservation({
          bookingId: "123",
          expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes
          groupSize: 5,
          date: "2024-12-25",
          timeSlot: "09:00 - 10:00",
          deposit: 50,
        });
      });

      const initialTime = result.current.timeRemaining;

      // Extend by 10 minutes
      act(() => {
        result.current.extendReservation(10);
      });

      expect(result.current.timeRemaining).toBeGreaterThan(initialTime);
    });

    it("should do nothing if no reservation exists", () => {
      const { result } = renderHook(() => useBookingSession(), {
        wrapper: AllTheProviders,
      });

      act(() => {
        result.current.extendReservation(10);
      });

      expect(result.current.reservation).toBeNull();
    });
  });
});
