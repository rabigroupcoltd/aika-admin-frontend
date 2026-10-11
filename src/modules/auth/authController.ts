import { useQuery } from '@tanstack/react-query';
import AxiosWithToken, { getToken } from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type { CurrentAdmin, SignInPayload, SignInResult } from './type';

export const AUTH_QUERY_KEY = 'auth';

export const SignInManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    SignInResult,
    Error,
    SignInPayload
  >({
    endpoint: '/auth/login',
    method: 'POST',
    isAuth: false,
    showErrorToast: false,
  });

  const signIn = async (details: SignInPayload) => {
    const result = await callApi(details);
    return result.data;
  };

  return { signIn, data, isLoading, isSuccess, isError, error };
};

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
