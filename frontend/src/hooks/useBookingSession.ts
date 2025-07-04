import { useState, useEffect, useCallback, useRef } from "react";
import { useCancelReservation } from "./useReservation";

interface ReservationData {
  bookingId: string;
  expiresAt: string;
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

  // Load reservation from localStorage on mount
  useEffect(() => {
    const loadReservation = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as ReservationData;
          const expiresAt = new Date(data.expiresAt);
          const now = new Date();

          if (expiresAt > now) {
            setReservation(data);
            setTimeRemaining(Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
          } else {
            // Reservation has expired, clean it up
            localStorage.removeItem(STORAGE_KEY);
            setIsExpired(true);
          }
        }
      } catch (error) {
        console.error("Failed to load reservation from storage:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadReservation();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (reservation && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            clearReservation(false); // Don't call backend when timer expires naturally
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const validatedData = {
        ...data,
        expiresAt: validExpiresAt,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedData));
      setReservation(validatedData);

      const expiresAt = new Date(validExpiresAt);
      const now = new Date();
      const remaining = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

      setTimeRemaining(Math.max(remaining, 0));
      setIsExpired(false);
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
