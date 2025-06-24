// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// User related types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

// Booking related types
export interface Booking {
  id: string; // UUID primary identifier
  date: string;
  timeSlot: string;
  groupSize: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  hasFeedback: boolean;
  userId: string;
  user?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface BookingsResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

// Payment related types
export interface Payment {
  id: number;
  amount: number;
  status: "pending" | "completed" | "failed";
  method: "credit_card" | "paypal" | "bank_transfer";
  bookingId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentsResponse {
  data: Payment[];
  total: number;
}

// Feedback related types
export interface Feedback {
  id: number;
  rating: number;
  comments: string;
  isPublic: boolean;
  bookingId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbacksResponse {
  data: Feedback[];
  total: number;
}

// Dashboard related types
export interface DashboardStats {
  totalBookings: number;
  pendingCheckIns: number;
  completedTours: number;
  feedbacks: number;
}

export interface DashboardApiResponse {
  data: DashboardStats;
}

export interface ActivityItem {
  id: string | number;
  type: string;
  description: string;
  timestamp: string | Date;
}

export interface ActivityApiResponse {
  data: ActivityItem[];
}

// Auth related types
export interface AuthResponse {
  access_token: string;
}
