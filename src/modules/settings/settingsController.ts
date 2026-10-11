import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type { PlatformSetting, UpdatePlatformSettingVariables } from './type';

export const SETTINGS_QUERY_KEY = 'settings';

export const useGetPlatformSettingsManager = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, 'list'],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<PlatformSetting[]>>('/settings');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const UpdatePlatformSettingManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    PlatformSetting,
    Error,
    UpdatePlatformSettingVariables
  >({
    endpoint: ({ key }: UpdatePlatformSettingVariables) => `/settings/${key}`,
    getBody: omitKeys<UpdatePlatformSettingVariables>('key'),
    queryKey: [SETTINGS_QUERY_KEY],
    method: 'PATCH',
    showSuccessToast: true,
  });

  const updateSetting = async (details: UpdatePlatformSettingVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { updateSetting, data, isLoading, isSuccess, isError, error };
};
