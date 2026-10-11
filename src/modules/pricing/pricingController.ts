import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type { PricingRule, UpdatePricingVariables } from './type';

export const PRICING_QUERY_KEY = 'pricing';

export const useGetPricingRulesManager = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [PRICING_QUERY_KEY, 'list'],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<PricingRule[]>>('/pricing');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const UpdatePricingRuleManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    PricingRule,
    Error,
    UpdatePricingVariables
  >({
    endpoint: ({ vehicleType }: UpdatePricingVariables) => `/pricing/${vehicleType}`,
    getBody: omitKeys<UpdatePricingVariables>('vehicleType'),
    queryKey: [PRICING_QUERY_KEY],
    method: 'PATCH',
    showSuccessToast: true,
  });

  const updatePricingRule = async (details: UpdatePricingVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { updatePricingRule, data, isLoading, isSuccess, isError, error };
};
