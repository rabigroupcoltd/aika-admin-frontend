import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type { AppUser, BlockUserVariables, CreateStaffVariables } from './type';

export const USERS_QUERY_KEY = 'users';

// ============================================
// QUERY CONTROLLERS
// ============================================

/**
 * Everyone with an account.
 *
 * Unpaginated, like `/drivers` — a plain array comes back, which is why the
 * screen filters it in the browser rather than passing a search term.
 * Admin/support only on the server now — see users.controller.ts.
 */
export const useGetUsersManager = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, 'list'],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<AppUser[]>>('/users');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

// ============================================
// MUTATION CONTROLLERS
// ============================================

/**
 * Blocks or unblocks any account. Admin only — see users.controller.ts.
 *
 * Takes effect on the account's very next request, not its next sign-in:
 * `JwtStrategy` re-checks `isBlocked` on every call.
 */
export const BlockUserManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    AppUser,
    Error,
    BlockUserVariables
  >({
    endpoint: ({ id }: BlockUserVariables) => `/users/${id}/block`,
    getBody: omitKeys<BlockUserVariables>('id'),
    queryKey: [USERS_QUERY_KEY],
    method: 'PATCH',
    showSuccessToast: true,
  });

  const blockUser = async (details: BlockUserVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { blockUser, data, isLoading, isSuccess, isError, error };
};

/**
 * Creates a new admin or support account — the dashboard's own equivalent of
 * `prisma/seed.ts`'s admin bootstrap, for every account after the first one.
 */
export const CreateStaffManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    AppUser,
    Error,
    CreateStaffVariables
  >({
    endpoint: '/users/staff',
    queryKey: [USERS_QUERY_KEY],
    method: 'POST',
    showSuccessToast: true,
  });

  const createStaff = async (details: CreateStaffVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { createStaff, data, isLoading, isSuccess, isError, error };
};
