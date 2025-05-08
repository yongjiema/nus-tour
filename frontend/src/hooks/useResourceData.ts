import { useList, UseListProps, BaseRecord, HttpError, GetListResponse } from "@refinedev/core";

/**
 * Custom hook for fetching resources with standardized error handling and logging
 * @param resource Resource name to fetch
 * @param userId User ID for authenticated requests
 * @param config Additional configuration for useList hook
 * @returns Wrapped useList return values with enhanced error handling
 */
export const useResourceData = <TData extends BaseRecord = BaseRecord>(
  resource: string,
  userId: string | null,
  config?: Partial<UseListProps<TData, HttpError, TData>>,
) => {
  const isDev = process.env.NODE_ENV === "development";

  return useList<TData>({
    resource,
    queryOptions: {
      enabled: !!userId,
      onError: (error: HttpError) => {
        if (isDev) {
          console.error(`Error fetching ${resource}:`, error);
          console.error(`${resource} error details:`, {
            status: error?.response?.status,
            data: error?.response?.data,
          });
        }
      },
      onSuccess: (data: GetListResponse<TData>) => {
        if (isDev) {
          console.log(`${resource} data received:`, {
            total: data.total,
            count: data.data?.length,
          });
        }
      },
      ...(config?.queryOptions || {}),
    },
    ...config,
  });
};
