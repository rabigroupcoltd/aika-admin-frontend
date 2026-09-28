import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import type { ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type {
  ActivityItem,
  AdminSummary,
  SocketActivity,
  TrendPoint,
  VehicleSplit,
} from './type';

// ============================================
// QUERY CONTROLLERS
// ============================================

/**
 * The dashboard's headline tiles.
 *
 * Also read by AppLayout for the sidebar badges, which is why the query key is
 * stable and the refetch interval lives at the call site — React Query dedupes
 * the two, so the layout and the dashboard share one request.
 */
export const useGetAdminSummaryManager = ({
  enabled = true,
  refetchInterval,
}: { enabled?: boolean; refetchInterval?: number } = {}) => {
  return useQuery({
    queryKey: ['admin', 'summary'],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<AdminSummary>>('/admin/summary');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchInterval,
    refetchOnWindowFocus: false,
  });
};

/** Orders and revenue per day. Empty days are zero-filled by the server. */
export const useGetOrderTrendManager = ({
  days = 14,
  enabled = true,
}: { days?: number; enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: ['admin', 'trend', days],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<TrendPoint[]>>('/admin/trend', {
          params: { days },
        });
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useGetVehicleSplitManager = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: ['admin', 'vehicle-split'],
    queryFn: async () => {
      try {
        const response =
          await AxiosWithToken.get<ApiResponse<VehicleSplit[]>>('/admin/vehicle-split');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

/** Deliveries, cancellations, sign-ups and new tickets, newest first. */
export const useGetActivityManager = ({
  limit = 20,
  enabled = true,
  refetchInterval,
}: { limit?: number; enabled?: boolean; refetchInterval?: number } = {}) => {
  return useQuery({
    queryKey: ['admin', 'activity', limit],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<ActivityItem[]>>('/admin/activity', {
          params: { limit },
        });
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchInterval,
    refetchOnWindowFocus: false,
  });
};

/**
 * The live driver pool and every order still on the market.
 *
 * Polled rather than pushed: the admin has no socket, and an operator watching
 * this screen wants it current without a manual refresh.
 */
export const useGetSocketActivityManager = ({
  enabled = true,
  refetchInterval = 10_000,
}: { enabled?: boolean; refetchInterval?: number } = {}) => {
  return useQuery({
    queryKey: ['admin', 'socket-activity'],
    queryFn: async () => {
      try {
        const response =
          await AxiosWithToken.get<ApiResponse<SocketActivity>>('/admin/socket-activity');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchInterval,
    refetchOnWindowFocus: false,
  });
};
