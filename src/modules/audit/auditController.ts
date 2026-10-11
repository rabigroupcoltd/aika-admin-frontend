import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import type { ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type { AuditEntity, AuditFilterParams, AuditLog, AuditPage } from './type';

export const AUDIT_ENTITIES: AuditEntity[] = [
  'DRIVER',
  'USER',
  'ORDER',
  'WALLET',
  'PRICING',
  'SUPPORT',
  'SYSTEM',
];

export const AUDIT_QUERY_KEY = 'audit';

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
