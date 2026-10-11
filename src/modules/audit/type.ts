export type AuditEntity =
  | 'DRIVER'
  | 'USER'
  | 'ORDER'
  | 'WALLET'
  | 'PRICING'
  | 'SUPPORT'
  | 'SYSTEM';

export interface AuditLog {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  entity: AuditEntity;
  entityId: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

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
