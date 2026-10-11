import type { Order, UserSummary } from '@/modules/orders/type';

export type SupportStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type SupportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface SupportTicket {
  id: string;
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
  fromStaff: boolean;
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
  assigneeId?: string | null;
}
