import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api.service';
import type {
  LoginRequest,
  KycApprovalRequest,
} from '../../types';

export const queryKeys = {
  all: ['api'] as const,
  dashboard: () => [...queryKeys.all, 'dashboard'] as const,
  users: () => [...queryKeys.all, 'users'] as const,
  pendingKyc: () => [...queryKeys.all, 'pending-kyc'] as const,
  payouts: () => [...queryKeys.all, 'payouts'] as const,
  auth: () => [...queryKeys.all, 'auth'] as const,
} as const;

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => apiService.getDashboardStats(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useUsersQuery = () => {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: () => apiService.getUsers(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const usePendingKycQuery = () => {
  return useQuery({
    queryKey: queryKeys.pendingKyc(),
    queryFn: () => apiService.getPendingKyc(),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

export const useApproveDriverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: KycApprovalRequest) => apiService.approveDriver(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingKyc() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
};

export const useProcessPayoutsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiService.processPayouts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => apiService.login(credentials),
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};