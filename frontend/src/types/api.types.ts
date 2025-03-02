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
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

// Booking related types
export interface Booking {
  id: number;
  date: string;
  timeSlot: string;
  groupSize: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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
  status: 'pending' | 'completed' | 'failed';
  method: 'credit_card' | 'paypal' | 'bank_transfer';
  bookingId: number;
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
  bookingId: number;
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

export interface DashboardStatsResponse {
  data: DashboardStats;
}

export interface ActivityItem {
  id: string | number;
  type: 'booking' | 'payment' | 'feedback' | 'check-in';
  description: string;
  timestamp: string;
}

export interface ActivityResponse {
  data: ActivityItem[];
  total: number;
}

// Auth related types
export interface AuthResponse {
  access_token: string;
}
