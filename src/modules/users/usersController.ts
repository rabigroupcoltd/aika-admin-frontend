import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type {
  AppUser,
  BlockUserVariables,
  CreateStaffVariables,
  DirectoryParams,
  DirectoryResponse,
  UserOverview,
} from './type';

export const USERS_QUERY_KEY = 'users';

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

export const useGetUserDirectoryManager = ({
  type,
  search,
  approval,
  enabled = true,
}: DirectoryParams & { enabled?: boolean }) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, 'directory', type, search ?? '', approval ?? ''],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<DirectoryResponse>>('/users/directory', {
          params: {
            type,
            ...(search?.trim() && { search: search.trim() }),
            ...(approval && { approval }),
          },
        });
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
  });
};

export const useGetUserOverviewManager = ({
  userId,
  enabled = true,
}: {
  userId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, 'overview', userId],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<UserOverview>>(
          `/users/${userId}/overview`,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled: enabled && Boolean(userId),
    refetchOnWindowFocus: false,
  });
};

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
