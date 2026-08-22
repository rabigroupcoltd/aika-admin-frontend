import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import type { ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type { UserSummary } from '@/modules/orders/ordersController';

// ============================================
// TypeScript Interfaces
// ============================================

export type { UserSummary };

export const USERS_QUERY_KEY = 'users';

// ============================================
// QUERY CONTROLLERS
// ============================================

/**
 * Everyone with an account.
 *
 * Unpaginated, like `/drivers` — a plain array comes back, which is why the
 * screen filters it in the browser rather than passing a search term.
 */
export const useGetUsersManager = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, 'list'],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<UserSummary[]>>('/users');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};
