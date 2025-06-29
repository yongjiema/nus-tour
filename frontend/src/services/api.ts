import { useCreate, useList, useUpdate, useCustomMutation, useCustom } from "@refinedev/core";
import type { CrudFilters, HttpError } from "@refinedev/core";

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  access_token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
  };
}

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  paymentMethod?: string;
}

export interface PaymentResponse {
  id: string;
  transactionId: string;
}

export interface BookingStatusUpdateRequest {
  status: string;
  transactionId: string;
  checkInTime?: string;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface ActivityApiResponse {
  data: ActivityItem[];
}

export interface CreateBookingRequest {
  date: string;
  timeSlot: string;
  groupSize: number;
  name: string;
  email: string;
  phone?: string;
  participants?: number;
  specialRequests?: string;
}

export interface CreateBookingResponse {
  id: string;
  date: string;
  groupSize: number;
  deposit: number;
  timeSlot: string;
  status: string;
  hasFeedback: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface FeedbackRequest {
  bookingId: string;
  email: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

export interface AdminBookingStatusUpdateRequest {
  status: string;
}

export interface Booking {
  id: string;
  bookingId: string;
  name: string;
  email: string;
  date: string;
  timeSlot: string;
  groupSize: number;
  status: string;
  bookingStatus: string;
  checkedIn: boolean;
  hasFeedback: boolean;
  createdAt: Date;
  deposit: number;
}

export interface TimeSlotAvailability {
  slot: string;
  available: number;
}

// Custom hooks using data providers properly
export const useRegister = () => {
  const { mutate, isPending } = useCustomMutation<RegisterResponse>();

  const register = (data: RegisterRequest) => {
    mutate({
      url: "auth/register",
      method: "post",
      values: data,
    });
  };

  return { register, isPending };
};

export const usePayment = () => {
  const { mutate, isPending } = useCustomMutation<PaymentResponse>();

  const processPayment = (data: PaymentRequest) => {
    mutate({
      url: "payments",
      method: "post",
      values: data,
    });
  };

  return { processPayment, isPending };
};

export const useBookingStatus = () => {
  const { mutate, isPending } = useUpdate();

  const updateBookingStatus = (bookingId: string, data: BookingStatusUpdateRequest) => {
    mutate({
      resource: "bookings",
      id: bookingId,
      values: data,
      meta: {
        operation: "payment-status",
      },
    });
  };

  return { updateBookingStatus, isPending };
};

export const useDashboardStats = () => {
  return useCustom<ApiResponse<DashboardStats>>({
    url: "admin/dashboard/stats",
    method: "get",
  });
};

export const useActivityFeed = () => {
  return useCustom<ActivityApiResponse>({
    url: "admin/dashboard/recent-activity",
    method: "get",
  });
};

export const useCreateBooking = () => {
  const { mutate, isPending } = useCustomMutation<CreateBookingResponse>();

  const createBooking = (
    data: CreateBookingRequest,
    options?: {
      onSuccess?: (response: CreateBookingResponse) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    mutate(
      {
        url: "bookings",
        method: "post",
        values: data,
      },
      {
        onSuccess: (response) => {
          options?.onSuccess?.(response.data);
        },
        onError: (error) => {
          options?.onError?.(error);
        },
      },
    );
  };

  return { createBooking, isPending };
};

export const useBookings = () => {
  return useList({
    resource: "bookings",
  });
};

export const useCreateFeedback = () => {
  const { mutate, isPending } = useCreate();

  const createFeedback = (data: FeedbackRequest) => {
    mutate({
      resource: "feedback",
      values: data,
    });
  };

  return { createFeedback, isPending };
};

export const useAdminBookings = (filters?: CrudFilters) => {
  return useList<Booking>({
    resource: "admin/bookings",
    filters,
    pagination: {
      mode: "off",
    },
  });
};

export const useAdminUpdateBookingStatus = () => {
  const { mutate, isPending } = useCustomMutation<ApiResponse<unknown>, HttpError, AdminBookingStatusUpdateRequest>();

  const updateBookingStatus = (id: string, data: AdminBookingStatusUpdateRequest) => {
    mutate(
      {
        url: `bookings/${id}/status`,
        method: "patch",
        values: data,
      },
      {
        onError: (error) => {
          console.error("Error updating booking status:", error);
        },
      },
    );
  };

  return {
    updateStatus: updateBookingStatus,
    isPending,
  };
};

// Time slots hook
export const useAvailableTimeSlots = (date?: string) => {
  return useCustom<TimeSlotAvailability[]>({
    url: `bookings/available-slots${date ? `?date=${date}` : ""}`,
    method: "get",
  });
};
