export interface User {
  id: string;
  email: string;
  profile?: {
    name: string;
  };
  status: string;
  driverStatus: string;
  kycDocuments?: Array<{
    type: string;
    url: string;
  }>;
}

export interface DashboardStats {
  totalUsers: number;
  totalRiders: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  pendingKyc: number;
  conversionRate: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn?: string;
  role?: string;
  userInfo?: User;
}

export interface WalletInfo {
  id: string;
  balance: number;
  userId: string;
  transaction?: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  status: string;
  description?: string;
  transactionRef: string;
  createdAt: string;
}

export interface PayoutProcessResponse {
  success: boolean;
  processedCount: number;
  totalAmount: number;
}

export interface KycApprovalRequest {
  userId: string;
  deviceToken: string;
}

export interface KycApprovalResponse {
  success: boolean;
  user: User;
}