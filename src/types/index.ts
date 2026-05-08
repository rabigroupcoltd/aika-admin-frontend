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
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
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