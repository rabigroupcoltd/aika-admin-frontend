import type { UserSummary, VehicleType } from '@/modules/orders/type';

export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  vehicleBrand: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  kycStatus: KycStatus;
  kycRejectionReason?: string | null;
  isAvailable: boolean;
  isBlocked: boolean;
  currentDebt: number;
  debtLimit: number | null;
  debt?: DriverDebtStatus;
  rating?: number | null;
  totalTrips?: number;
  createdAt: string;
  user?: UserSummary;
  wallet?: DriverWallet | null;
  vehiclePhotos?: VehiclePhoto[];
}

export interface VehiclePhoto {
  id: string;
  type: string;
  url: string;
}

export interface DriverDebtStatus {
  current: number;
  limit: number;
  isOverride: boolean;
  locked: boolean;
  remaining: number | null;
}

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
  debtLimit: number | null;
}
