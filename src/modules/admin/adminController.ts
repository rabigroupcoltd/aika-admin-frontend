import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import type { ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type {
  ActivityItem,
  AdminSummary,
  LiveDrivers,
  SocketActivity,
  TrendPoint,
  VehicleSplit,
} from './type';

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

export const useGetLiveDriversManager = ({
  includeOffline = false,
  enabled = true,
  refetchInterval = 30_000,
}: { includeOffline?: boolean; enabled?: boolean; refetchInterval?: number } = {}) => {
  return useQuery({
    queryKey: ['admin', 'live-drivers', includeOffline],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<LiveDrivers>>('/admin/live-drivers', {
          params: includeOffline ? { includeOffline: true } : undefined,
        });
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
};

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
