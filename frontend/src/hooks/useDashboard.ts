import { useCustom } from "@refinedev/core";
import type { ApiResponse, DashboardStats, ActivityApiResponse, UserDashboardApiResponse } from "../types/api.types";

export const useDashboardStats = () => {
  return useCustom<ApiResponse<DashboardStats>>({
    url: "admin/dashboard/stats",
    method: "get",
  });
};

export const useUserDashboardStats = () => {
  return useCustom<UserDashboardApiResponse>({
    url: "bookings/user/stats",
    method: "get",
    errorNotification: false, // Disable error notifications
    queryOptions: {
      retry: 1, // Only retry once
      retryDelay: 1000, // Wait 1 second before retry
    },
  });
};

export const useActivityFeed = () => {
  return useCustom<ActivityApiResponse>({
    url: "admin/dashboard/recent-activity",
    method: "get",
  });
};

export const useUserActivity = () => {
  return useCustom<ActivityApiResponse>({
    url: "bookings/user/activity",
    method: "get",
    errorNotification: false, // Disable error notifications
    queryOptions: {
      retry: 1, // Only retry once
      retryDelay: 1000, // Wait 1 second before retry
    },
  });
};
