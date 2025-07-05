// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  status?: number;
  message?: string;
}

// Auth related types
export interface AuthResponse {
  access_token: string;
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
  userId?: string;
  user?: UserProfile;
  updatedAt?: string;
  expiresAt?: string; // Expiration time for slot reservations
}

export interface BookingsResponse {
  data: Booking[];
  total: number;
  page?: number;
  limit?: number;
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

export interface BookingStatusUpdateRequest {
  status: string;
  transactionId: string;
  checkInTime?: string;
}

export interface AdminBookingStatusUpdateRequest {
  status: string;
}

export interface TimeSlotAvailability {
  slot: string;
  available: number;
  userHasBooking?: boolean;
  userBookingStatus?: string;
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

export interface PaymentData {
  bookingId: string;
  amount: number;
  paymentMethod?: string;
}

export interface PaymentResponse {
  id: string;
  transactionId: string;
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

export interface FeedbackRequest {
  bookingId: string;
  email: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

export interface FeedbacksResponse {
  data: Feedback[];
  total: number;
}

// Dashboard related types
export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  pendingCheckIns?: number;
  completedTours?: number;
  feedbacks?: number;
}

// User-specific dashboard stats
export interface UserDashboardStats {
  upcomingTours: number;
  completedTours: number;
  totalBookings: number;
  pendingPayments: number;
}

export interface DashboardApiResponse {
  data: DashboardStats;
}

export interface UserDashboardApiResponse {
  data: UserDashboardStats;
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
