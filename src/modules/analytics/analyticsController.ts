import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import type { ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type { VehicleType } from '@/modules/orders/ordersController';

// ============================================
// TypeScript Interfaces
// ============================================

/**
 * Platform-wide figures.
 *
 * "Completed" counts both lanes — the legacy bid flow ends at COMPLETED and the
 * marketplace at DELIVERED, and counting only the first reported zero revenue
 * for the whole pilot.
 */
export interface AnalyticsOverview {
  totalUsers: number;
  totalDrivers: number;
  activeDrivers: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  /** One decimal place, as a string. */
  completionRate: string;
  cancellationRate: string;
  cashRevenue: number;
  transferRevenue: number;
  totalRevenue: number;
  platformEarnings: number;
  /** What drivers still owe on cash fares. */
  outstandingDebt: number;
}

export interface TopDriver {
  id: string;
  name: string | null;
  vehicleType: VehicleType;
  totalTrips: number;
  totalEarnings: number;
  rating: number | null;
}

export const ANALYTICS_QUERY_KEY = 'analytics';

// ============================================
// QUERY CONTROLLERS
// ============================================

export const useGetAnalyticsOverviewManager = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'overview'],
    queryFn: async () => {
      try {
        const response =
          await AxiosWithToken.get<ApiResponse<AnalyticsOverview>>('/analytics/overview');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useGetTopDriversManager = ({
  limit = 10,
  enabled = true,
}: { limit?: number; enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'top-drivers', limit],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<TopDriver[]>>(
          '/analytics/top-drivers',
          { params: { limit } },
        );
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};
