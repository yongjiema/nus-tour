import { useList } from "@refinedev/core";
import type { UseListProps, BaseRecord, GetListResponse, HttpError } from "@refinedev/core";

interface ErrorWithResponse extends HttpError {
  response?: {
    status: number;
    data: unknown;
  };
}

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
      onError: (error: ErrorWithResponse) => {
        if (isDev) {
          console.error(`Error fetching ${resource}:`, error);
          if (error.response) {
            console.error(`${resource} error details:`, {
              status: error.response.status,
              data: error.response.data,
            });
          }
        }
      },
      onSuccess: (data: GetListResponse<TData>) => {
        if (isDev) {
          console.log(`${resource} data received:`, {
            total: data.total,
            count: data.data.length,
          });
        }
      },
      ...(config?.queryOptions ?? {}),
    },
    ...config,
  });
};
