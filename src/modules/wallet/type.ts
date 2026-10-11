import type { Driver } from '@/modules/drivers/type';

export type TransactionType =
  | 'RIDE_EARNINGS'
  | 'PLATFORM_FEE'
  | 'WITHDRAWAL'
  | 'DEBT_PAYMENT'
  | 'ADJUSTMENT';

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

export interface DriverWalletWithDriver extends DriverWallet {
  driver: Driver;
}

export interface LedgerTransaction {
  id: string;
  driverId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  reference: string;
  description: string;
  createdAt: string;
}

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
