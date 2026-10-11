export type AppUserRole = 'USER' | 'RIDER' | 'ADMIN' | 'SUPPORT';

export interface AppUser {
  id: string;
  email: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  photoUrl: string | null;
  profilePhotoUrl: string | null;
  roles: AppUserRole[];
  authProvider: 'FIREBASE_GOOGLE' | 'FIREBASE_PHONE' | 'PASSWORD';
  isBlocked: boolean;
  blockedReason: string | null;
  createdAt: string;
}

export interface BlockUserVariables {
  id: string;
  isBlocked: boolean;
  reason?: string;
}

export type StaffRole = 'ADMIN' | 'SUPPORT';

export interface CreateStaffVariables {
  email: string;
  password: string;
  name: string;
  role: StaffRole;
}

export type DirectoryType = 'PASSENGER' | 'DRIVER' | 'STAFF';

export type DriverApproval = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DirectoryDriver {
  id: string;
  kycStatus: Exclude<DriverApproval, 'NOT_SUBMITTED'>;
  kycRejectionReason: string | null;
  vehicleType: string;
  vehiclePlate: string | null;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  isAvailable: boolean;
  isBlocked: boolean;
  currentDebt: number;
  debtLimit: number | null;
  rating: number;
  totalTrips: number;
  createdAt: string;
  debt: import('@/modules/drivers/type').DriverDebtStatus;
}

export interface DirectoryUser extends AppUser {
  accountType: 'PASSENGER' | 'RIDER' | null;
  onboardingStep: string;
  lastLoginAt: string | null;
  updatedAt: string;
  passengerTrips: number;
  driverStatus: DriverApproval | null;
  driver: DirectoryDriver | null;
}

export interface DirectoryCounts {
  passengers: number;
  drivers: number;
  staff: number;
  pendingDrivers: number;
  notSubmitted: number;
}

export interface DirectoryResponse {
  counts: DirectoryCounts;
  result: DirectoryUser[];
}

export interface DirectoryParams {
  type: DirectoryType;
  search?: string;
  approval?: DriverApproval | '';
}

export interface UserOverview extends Omit<DirectoryUser, 'driver' | 'passengerTrips'> {
  dob: string | null;
  livenessPassedAt: string | null;
  onboardingCompletedAt: string | null;
  driver:
    | (import('@/modules/drivers/type').Driver & {
        vehicleYear: number | null;
        kycRejectionReason: string | null;
      })
    | null;
  stats: {
    passenger: { trips: number; completed: number; spent: number };
    driver: {
      trips: number;
      completed: number;
      fares: number;
      earnings: number;
      commission: number;
    } | null;
  };
}
