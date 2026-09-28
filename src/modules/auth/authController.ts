import { useQuery } from '@tanstack/react-query';
import AxiosWithToken, { getToken } from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type { CurrentAdmin, SignInPayload, SignInResult } from './type';

export const AUTH_QUERY_KEY = 'auth';

// ============================================
// MUTATION CONTROLLERS
// ============================================

/**
 * Staff sign-in.
 *
 * `isAuth: false` — this is the one call made before a token exists, so it goes
 * through the plain axios instance rather than the one that attaches an
 * Authorization header and redirects on 401.
 *
 * Email and password, not Firebase: app accounts are created through Firebase
 * and carry no password, so they can never authenticate here. That is the
 * point — this endpoint only admits seeded staff.
 */
export const SignInManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    SignInResult,
    Error,
    SignInPayload
  >({
    endpoint: '/auth/login',
    method: 'POST',
    isAuth: false,
    // The screen shows the failure inline under the form; a toast in the corner
    // for a form the user is looking at is the wrong place for it.
    showErrorToast: false,
  });

  const signIn = async (details: SignInPayload) => {
    const result = await callApi(details);
    return result.data;
  };

  return { signIn, data, isLoading, isSuccess, isError, error };
};

// ============================================
// QUERY CONTROLLERS
// ============================================

/**
 * The signed-in staff member, for role gating.
 *
 * Deliberately a live call rather than trusting whatever `Login.tsx` stored at
 * sign-in time — a role change (ADMIN promoting someone to SUPPORT, or the
 * reverse) has to be reflected the next time the sidebar renders, not at the
 * next sign-in. Called from `AppLayout` and deduped by React Query wherever
 * else it is called, the same way the dashboard summary already is.
 */
export const useGetCurrentAdminManager = () => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEY, 'profile'],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<CurrentAdmin>>('/auth/profile');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled: Boolean(getToken()),
    staleTime: 60_000,
  });
};
