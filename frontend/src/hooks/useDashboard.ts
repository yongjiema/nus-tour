import { useCustom } from "@refinedev/core";
import type { ApiResponse, DashboardStats, ActivityApiResponse } from "../types/api.types";

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
