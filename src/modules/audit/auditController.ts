import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import type { ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';

// ============================================
// TypeScript Interfaces
// ============================================

export type AuditEntity =
  | 'DRIVER'
  | 'USER'
  | 'ORDER'
  | 'WALLET'
  | 'PRICING'
  | 'SUPPORT'
  | 'SYSTEM';

export const AUDIT_ENTITIES: AuditEntity[] = [
  'DRIVER',
  'USER',
  'ORDER',
  'WALLET',
  'PRICING',
  'SUPPORT',
  'SYSTEM',
];

export interface AuditLog {
  id: string;
  actorId: string | null;
  /** Denormalised, so the trail still reads correctly after a rename. */
  actorName: string | null;
  actorRole: string | null;
  /** Dotted verb — `driver.kyc.approve`, `order.cancel`. */
  action: string;
  entity: AuditEntity;
  entityId: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

/**
 * The audit module is newer than the rest of the API and returns
 * `{ data, meta }` rather than the `pagingData` envelope the older controllers
 * use. Two paging shapes exist; this is the second.
 */
export interface AuditPage {
  data: AuditLog[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface AuditFilterParams {
  entity?: AuditEntity | '';
  entityId?: string;
  actorId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const AUDIT_QUERY_KEY = 'audit';

// ============================================
// QUERY CONTROLLERS
// ============================================

/**
 * The trail, newest first.
 *
 * Read-only by construction: there is no write, update or delete endpoint, so
 * this module has no mutation controllers at all. A log an admin can edit
 * answers no question worth asking.
 */
export const useGetAuditLogsManager = ({
  entity,
  entityId,
  actorId,
  action,
  from,
  to,
  page = 1,
  limit = 25,
  enabled = true,
}: AuditFilterParams & { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEY, 'list', entity, entityId, actorId, action, from, to, page, limit],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<AuditPage>>('/audit', {
          params: {
            page,
            limit,
            ...(entity && { entity }),
            ...(entityId && { entityId }),
            ...(actorId && { actorId }),
            ...(action && { action }),
            ...(from && { from }),
            ...(to && { to }),
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

/** Distinct action verbs in use, for the filter dropdown. */
export const useGetAuditActionsManager = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEY, 'actions'],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<string[]>>('/audit/actions');
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Everything that ever happened to one record.
 *
 * The question an admin actually asks — "why does this driver look like this" —
 * is about a row, not a time range. Rendered on the driver and order detail
 * screens rather than here.
 */
export const useGetEntityHistoryManager = ({
  entity,
  entityId,
  enabled = true,
}: {
  entity: AuditEntity;
  entityId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEY, entity, entityId],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<AuditLog[]>>(
          `/audit/${entity}/${entityId}`,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled: enabled && Boolean(entityId),
    refetchOnWindowFocus: false,
  });
};
