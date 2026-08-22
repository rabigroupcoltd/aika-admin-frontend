import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type { Order, UserSummary } from '@/modules/orders/ordersController';

// ============================================
// TypeScript Interfaces
// ============================================

export type SupportStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type SupportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export const SUPPORT_STATUSES: SupportStatus[] = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'];
export const SUPPORT_PRIORITIES: SupportPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export interface SupportTicket {
  id: string;
  /** Short and quotable over the phone — a uuid is unreadable aloud. */
  reference: string;
  requesterId: string;
  orderId: string | null;
  subject: string;
  category: string | null;
  status: SupportStatus;
  priority: SupportPriority;
  assigneeId: string | null;
  lastMessageAt: string;
  createdAt: string;
  requester?: UserSummary;
  assignee?: UserSummary | null;
  _count?: { messages: number };
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  /** Stored rather than derived from the sender's current role. */
  fromStaff: boolean;
  /** Staff-only note. The server strips these for the requester. */
  internal: boolean;
  body: string;
  createdAt: string;
  sender?: UserSummary;
}

export interface SupportTicketDetail extends SupportTicket {
  messages: SupportMessage[];
  order: Pick<
    Order,
    'id' | 'status' | 'description' | 'pickupLocation' | 'dropoffLocation' | 'fare' | 'currency'
  > | null;
}

/** The queue page, with per-status counts for the tabs above the table. */
export interface SupportQueue {
  data: SupportTicket[];
  meta: { page: number; limit: number; total: number; pages: number };
  counts: Record<SupportStatus, number>;
}

export interface SupportFilterParams {
  status?: SupportStatus | '';
  priority?: SupportPriority | '';
  assigneeId?: string;
  unassigned?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

export interface ReplyVariables {
  id: string;
  body: string;
  internal?: boolean;
}

export interface UpdateTicketVariables {
  id: string;
  status?: SupportStatus;
  priority?: SupportPriority;
  /** `null` unassigns — distinct from omitting the key, which leaves it alone. */
  assigneeId?: string | null;
}

export const SUPPORT_QUERY_KEY = 'support';

// ============================================
// QUERY CONTROLLERS
// ============================================

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

// ============================================
// MUTATION CONTROLLERS
// ============================================

/**
 * Post a message on a ticket.
 *
 * A staff reply moves an OPEN ticket to PENDING and a customer reply reopens a
 * RESOLVED one — both decided on the server, so the screen only has to refetch.
 * An internal note does neither: staff talking among themselves should not drag
 * a closed ticket back into the queue.
 */
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

/** Assign, reprioritise or close. Every change is written to the audit trail. */
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
