import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import type { ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type { AnalyticsOverview, TopDriver } from './type';

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
