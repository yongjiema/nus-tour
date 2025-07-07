import { useState, useEffect, useCallback, useRef } from "react";
import { useCancelReservation } from "./useReservation";
import { useNotification } from "@refinedev/core";

interface ReservationData {
  bookingId: string;
  expiresAt: string | null;
  groupSize: number;
  date: string;
  timeSlot: string;
  deposit: number;
}

interface UseBookingSessionResult {
  reservation: ReservationData | null;
  timeRemaining: number; // in seconds
  isExpired: boolean;
  saveReservation: (data: ReservationData) => void;
  clearReservation: (callBackend?: boolean) => void;
  extendReservation: (minutes: number) => void;
}

const STORAGE_KEY = "booking_reservation";

export const useBookingSession = (): UseBookingSessionResult => {
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate: cancelReservationAPI } = useCancelReservation();
  const { open: notify } = useNotification();

  // Load reservation from localStorage on mount
  useEffect(() => {
    const loadReservation = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as ReservationData;
          const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
          const now = new Date();
          if (expiresAt && expiresAt > now) {
            setReservation(data);
            setTimeRemaining(Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
            setIsExpired(false);
          } else {
            setReservation(null);
            setTimeRemaining(0);
            setIsExpired(true);
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (_error) {
        setReservation(null);
        setTimeRemaining(0);
        setIsExpired(true);
        localStorage.removeItem(STORAGE_KEY);
        notify?.({
          type: "error",
          message: "Failed to load your booking session. Please try again or contact support.",
        });
      }
    };

    loadReservation();
  }, [notify]);

  // Countdown timer
  useEffect(() => {
    if (reservation && timeRemaining > 0 && !isExpired) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            // Clear reservation when timer expires
            try {
              localStorage.removeItem(STORAGE_KEY);
              setReservation(null);
              setTimeRemaining(0);
            } catch (error) {
              console.error("Failed to clear expired reservation:", error);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [reservation, isExpired, timeRemaining]);

  const saveReservation = useCallback((data: ReservationData) => {
    try {
      // Handle null or invalid expiresAt by creating a new expiration time
      let validExpiresAt = data.expiresAt;
      if (!validExpiresAt) {
        console.warn("expiresAt is null or invalid, creating new expiration time");
        const newExpiresAt = new Date();
        newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 15); // 15 minutes from now
        validExpiresAt = newExpiresAt.toISOString();
      }
      setReservation({
        ...data,
        expiresAt: validExpiresAt,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, expiresAt: validExpiresAt }));
      // Update time remaining
      const expiresAt = validExpiresAt ? new Date(validExpiresAt) : null;
      const now = new Date();
      const remaining = expiresAt ? Math.floor((expiresAt.getTime() - now.getTime()) / 1000) : 0;
      setTimeRemaining(remaining);
      setIsExpired(remaining <= 0);
    } catch (error) {
      console.error("Failed to save reservation to storage:", error);
    }
  }, []);

  const clearReservation = useCallback(
    (callBackend = false) => {
      const currentReservation = reservation;

      try {
        localStorage.removeItem(STORAGE_KEY);
        setReservation(null);
        setTimeRemaining(0);
        setIsExpired(false);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Call backend API to cancel reservation if requested and we have a booking ID
        if (callBackend && currentReservation?.bookingId) {
          cancelReservationAPI(currentReservation.bookingId, {
            onError: (error) => {
              console.error("Failed to cancel reservation on backend:", error);
              // Note: We don't restore the local state even if the backend call fails
              // because the user explicitly requested to cancel
            },
          });
        }
      } catch (error) {
        console.error("Failed to clear reservation from storage:", error);
      }
    },
    [reservation, cancelReservationAPI],
  );

  const extendReservation = useCallback(
    (minutes: number) => {
      if (reservation) {
        const newExpiresAt = new Date();
        newExpiresAt.setMinutes(newExpiresAt.getMinutes() + minutes);

        const updatedReservation = {
          ...reservation,
          expiresAt: newExpiresAt.toISOString(),
        };

        saveReservation(updatedReservation);
      }
    },
    [reservation, saveReservation],
  );

  return {
    reservation,
    timeRemaining,
    isExpired,
    saveReservation,
    clearReservation,
    extendReservation,
  };
};

export type { ReservationData };
