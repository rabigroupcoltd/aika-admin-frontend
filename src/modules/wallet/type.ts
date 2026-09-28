import type { Driver } from '@/modules/drivers/type';

export type TransactionType =
  | 'RIDE_EARNINGS'
  | 'PLATFORM_FEE'
  | 'WITHDRAWAL'
  | 'DEBT_PAYMENT'
  | 'ADJUSTMENT';

/**
 * Field names match the Prisma model exactly — `totalEarnings`, not
 * `totalEarned`. `modules/drivers/type.ts` used to declare a second,
 * differently-spelled copy of this shape that nothing actually read; this is
 * now the one definition.
 */
export interface DriverWallet {
  id: string;
  driverId: string;
  totalEarnings: number;
  totalWithdrawals: number;
  totalDebt: number;
  availableBalance: number;
  pendingBalance: number;
  createdAt: string;
  updatedAt: string;
}

/** `GET /wallet/all` — every wallet, sorted by available balance, with the owning driver attached. */
export interface DriverWalletWithDriver extends DriverWallet {
  driver: Driver;
}

export interface LedgerTransaction {
  id: string;
  driverId: string;
  type: TransactionType;
  /** Negative for anything that leaves the wallet — a withdrawal, a debt payment. */
  amount: number;
  balanceAfter: number;
  reference: string;
  description: string;
  createdAt: string;
}

/** The older paging envelope — see the admin README's "Two paging envelopes" note. */
export interface PagedResponse<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  result: T[];
}

export interface ListTransactionsParams {
  driverId: string;
  limit?: number;
  offset?: number;
}
