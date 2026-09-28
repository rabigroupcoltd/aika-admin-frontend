import type { UserSummary, VehicleType } from '@/modules/orders/type';

export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Field names match the Prisma model exactly — see `modules/wallet/type.ts`,
 * which is the fuller, canonical version of this shape (also used for the
 * `/wallet/all` list). Kept duplicated rather than imported, to avoid a
 * circular import between the two modules over a handful of fields.
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

export interface Driver {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  vehiclePlate: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  kycStatus: KycStatus;
  kycRejectionReason?: string | null;
  isAvailable: boolean;
  isBlocked: boolean;
  /** Cash fares owed to the platform. Past `debtLimit` the driver is blocked. */
  currentDebt: number;
  debtLimit: number;
  rating?: number | null;
  totalTrips?: number;
  createdAt: string;
  user?: UserSummary;
  wallet?: DriverWallet | null;
}

export interface DriverFilterParams {
  vehicleType?: string;
  kycStatus?: KycStatus | '';
  isAvailable?: boolean;
}

export interface RejectKycVariables {
  id: string;
  reason: string;
}

export interface BlockDriverVariables {
  id: string;
  isBlocked: boolean;
}

export interface PayDebtVariables {
  id: string;
  amount: number;
}

export interface DebtLimitVariables {
  id: string;
  debtLimit: number;
}
