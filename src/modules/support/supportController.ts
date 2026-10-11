import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type {
  ReplyVariables,
  SupportFilterParams,
  SupportMessage,
  SupportPriority,
  SupportQueue,
  SupportStatus,
  SupportTicketDetail,
  UpdateTicketVariables,
} from './type';

export const SUPPORT_STATUSES: SupportStatus[] = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'];
export const SUPPORT_PRIORITIES: SupportPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export const SUPPORT_QUERY_KEY = 'support';

export const useGetTicketsManager = ({
  status,
  priority,
  assigneeId,
  unassigned,
  q,
  page = 1,
  limit = 50,
  enabled = true,
}: SupportFilterParams & { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [SUPPORT_QUERY_KEY, 'list', status, priority, assigneeId, unassigned, q, page, limit],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<SupportQueue>>('/support', {
          params: {
            page,
            limit,
            ...(status && { status }),
            ...(priority && { priority }),
            ...(assigneeId && { assigneeId }),
            ...(unassigned && { unassigned }),
            ...(q && { q }),
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

export const useGetTicketByIdManager = ({
  ticketId,
  enabled = true,
}: {
  ticketId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [SUPPORT_QUERY_KEY, ticketId],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<SupportTicketDetail>>(
          `/support/${ticketId}`,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled: enabled && Boolean(ticketId),
    refetchOnWindowFocus: false,
  });
};

export const ReplyToTicketManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    SupportMessage,
    Error,
    ReplyVariables
  >({
    endpoint: ({ id }: ReplyVariables) => `/support/${id}/reply`,
    getBody: omitKeys<ReplyVariables>('id'),
    queryKey: [SUPPORT_QUERY_KEY],
    method: 'POST',
  });

  const replyToTicket = async (details: ReplyVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { replyToTicket, data, isLoading, isSuccess, isError, error };
};

export const UpdateTicketManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    SupportTicketDetail,
    Error,
    UpdateTicketVariables
  >({
    endpoint: ({ id }: UpdateTicketVariables) => `/support/${id}`,
    getBody: omitKeys<UpdateTicketVariables>('id'),
    queryKey: [SUPPORT_QUERY_KEY],
    method: 'PATCH',
    showSuccessToast: true,
  });

  const updateTicket = async (details: UpdateTicketVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { updateTicket, data, isLoading, isSuccess, isError, error };
};
