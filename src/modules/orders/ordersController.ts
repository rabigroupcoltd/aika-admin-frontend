import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import type {
  CancelOrderVariables,
  Order,
  OrderFilterParams,
  PagedResponse,
} from './type';
import { parseApiError } from '@/utils/parseApiError';

export const ORDERS_QUERY_KEY = 'orders';

export const useGetOrdersManager = ({
  status,
  vehicleType,
  driverId,
  userId,
  page = 1,
  limit = 25,
  enabled = true,
}: OrderFilterParams & { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, 'list', status, vehicleType, driverId, userId, page, limit],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<PagedResponse<Order>>>('/orders', {
          params: {
            page,
            limit,
            ...(status && { status }),
            ...(vehicleType && { vehicleType }),
            ...(driverId && { driverId }),
            ...(userId && { userId }),
          },
        });
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useGetOrderByIdManager = ({
  orderId,
  enabled = true,
}: {
  orderId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, orderId],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<Order>>(`/orders/${orderId}`);
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled: enabled && Boolean(orderId),
    refetchOnWindowFocus: false,
  });
};

export const CancelOrderManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    Order,
    Error,
    CancelOrderVariables
  >({
    endpoint: ({ id }: CancelOrderVariables) => `/orders/${id}/cancel`,
    getBody: omitKeys<CancelOrderVariables>('id'),
    queryKey: [ORDERS_QUERY_KEY],
    method: 'POST',
    showSuccessToast: true,
  });

  const cancelOrder = async (details: CancelOrderVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { cancelOrder, data, isLoading, isSuccess, isError, error };
};
