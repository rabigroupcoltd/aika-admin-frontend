import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import type { ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type {
  DriverWalletWithDriver,
  ListTransactionsParams,
  PagedResponse,
  LedgerTransaction,
} from './type';

export const WALLET_QUERY_KEY = 'wallet';

// ============================================
// QUERY CONTROLLERS
// ============================================

/** Admin only. Every driver's wallet, sorted by available balance — the payouts view. */
export const useGetAllWalletsManager = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [WALLET_QUERY_KEY, 'all'],
    queryFn: async () => {
      try {
        const response =
          await AxiosWithToken.get<ApiResponse<DriverWalletWithDriver[]>>('/wallet/all');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * The ledger for one driver — every earning, fee, withdrawal, debt payment and
 * manual adjustment, newest first. `limit`/`offset`, not `page`: this mirrors
 * `ListTransactionsQueryDto` on the server exactly rather than translating.
 */
export const useGetWalletTransactionsManager = ({
  driverId,
  limit = 20,
  offset = 0,
  enabled = true,
}: ListTransactionsParams & { enabled?: boolean }) => {
  return useQuery({
    queryKey: [WALLET_QUERY_KEY, 'transactions', driverId, limit, offset],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<PagedResponse<LedgerTransaction>>>(
          `/wallet/driver/${driverId}/transactions`,
          { params: { limit, offset } },
        );
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled: enabled && Boolean(driverId),
    refetchOnWindowFocus: false,
  });
};
