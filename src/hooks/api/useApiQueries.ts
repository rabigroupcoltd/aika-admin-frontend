import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api.service';
import type {
  LoginRequest,
  KycApprovalRequest,
} from '../../types';

export const queryKeys = {
  all: ['api'] as const,
  dashboard: () => [...queryKeys.all, 'dashboard'] as const,
  dashboardAnalytics: () => [...queryKeys.all, 'dashboard-analytics'] as const,
  users: () => [...queryKeys.all, 'users'] as const,
  user: (id: string) => [...queryKeys.all, 'user', id] as const,
  riders: () => [...queryKeys.all, 'riders'] as const,
  orders: () => [...queryKeys.all, 'orders'] as const,
  transactions: () => [...queryKeys.all, 'transactions'] as const,
  pendingKyc: () => [...queryKeys.all, 'pending-kyc'] as const,

  payouts: () => [...queryKeys.all, 'payouts'] as const,
  payoutSummary: () => [...queryKeys.all, 'payout-summary'] as const,
  auth: () => [...queryKeys.all, 'auth'] as const,

  wallet: (userId: string) => [...queryKeys.all, 'wallet', userId] as const,
} as const;

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => apiService.getDashboardStats(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useDashboardAnalyticsQuery = () => {
  return useQuery({
    queryKey: queryKeys.dashboardAnalytics(),
    queryFn: () => apiService.getDashboardAnalytics(),
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

export const useOrdersQuery = () => {
  return useQuery({
    queryKey: queryKeys.orders(),
    queryFn: () => apiService.getOrders(),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

export const useRidersQuery = () => {
  return useQuery({
    queryKey: queryKeys.riders(),
    queryFn: () => apiService.getRiders(),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

export const useTransactionsQuery = () => {
  return useQuery({
    queryKey: queryKeys.transactions(),
    queryFn: () => apiService.getTransactions(),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};


export const useWalletQuery = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.wallet(userId),
    queryFn: () => apiService.getUserWallet(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.payoutSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
};

export const usePayoutSummaryQuery = () => {
  return useQuery({
    queryKey: queryKeys.payoutSummary(),
    queryFn: () => apiService.getPayoutSummary(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};


export const useCreditWalletMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, note }: { amount: number; note?: string }) =>
      apiService.creditWallet(userId, amount, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
};

export const useDebitWalletMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, note }: { amount: number; note?: string }) =>
      apiService.debitWallet(userId, amount, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet(userId) });
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