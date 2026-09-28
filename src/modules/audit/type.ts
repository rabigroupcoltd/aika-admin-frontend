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
