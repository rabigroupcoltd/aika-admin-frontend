import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';

export const ACCOUNT_QUERY_KEY = 'account-deletion';

export type DeletionStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

export interface DeletionRequest {
  id: string;
  contact: string;
  reason: string | null;
  source: string;
  status: DeletionStatus;
  note: string | null;
  processedAt: string | null;
  createdAt: string;
  userId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    roles: string[];
    deletedAt: string | null;
  } | null;
}

export const useGetDeletionRequestsManager = ({ status }: { status?: DeletionStatus | '' } = {}) => {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEY, status ?? ''],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<{ pending: number; result: DeletionRequest[] }>>(
          '/account/deletion-requests',
          { params: status ? { status } : undefined },
        );
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    refetchOnWindowFocus: false,
  });
};

export const ProcessDeletionManager = () => {
  const { callApi, isLoading } = useApiManager<unknown, Error, { id: string; userId?: string }>({
    endpoint: ({ id }: { id: string }) => `/account/deletion-requests/${id}/process`,
    getBody: omitKeys<{ id: string; userId?: string }>('id'),
    queryKey: [ACCOUNT_QUERY_KEY],
    method: 'POST',
    showSuccessToast: true,
  });
  return { processRequest: callApi, isLoading };
};

export const RejectDeletionManager = () => {
  const { callApi, isLoading } = useApiManager<unknown, Error, { id: string; note?: string }>({
    endpoint: ({ id }: { id: string }) => `/account/deletion-requests/${id}/reject`,
    getBody: omitKeys<{ id: string; note?: string }>('id'),
    queryKey: [ACCOUNT_QUERY_KEY],
    method: 'POST',
    showSuccessToast: true,
  });
  return { rejectRequest: callApi, isLoading };
};
