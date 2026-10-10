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
  /** Commission owed to the platform from cash trips. */
  currentDebt: number;
  /** This driver's own limit, or null when they follow the platform setting. */
  debtLimit: number | null;
  /** Derived server-side: the limit in force and whether it has been reached. */
  debt?: DriverDebtStatus;
  rating?: number | null;
  totalTrips?: number;
  createdAt: string;
  user?: UserSummary;
  wallet?: DriverWallet | null;
  /** Documents and vehicle shots uploaded at registration. */
  vehiclePhotos?: VehiclePhoto[];
}

export interface VehiclePhoto {
  id: string;
  /** FRONT, BACK, PLATE_NUMBER, LICENSE, … — whatever the app labelled it. */
  type: string;
  url: string;
}

export interface DriverDebtStatus {
  current: number;
  /** The limit in force. 0 means no limit. */
  limit: number;
  /** True when the limit is this driver's own rather than the platform default. */
  isOverride: boolean;
  /** At or over the limit: cannot go online or take new orders. */
  locked: boolean;
  remaining: number | null;
}

/** A rider who chose to drive but never submitted their vehicle. */
export interface IncompleteApplication {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  profilePhotoUrl: string | null;
  onboardingStep: string;
  createdAt: string;
  updatedAt: string;
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
  /** null resets the driver to the platform default. */
  debtLimit: number | null;
}
