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

export interface DashboardAnalytics {
  monthlyTransactions: Array<{
    month: string;
    total: number;
  }>;
}


export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  customerId: string;
  riderId?: string;
  customer?: {
    profile?: { name: string };
  };
  rider?: {
    profile?: { name: string };
  };
  createdAt: string;
}

export interface Rider {
  id: string;
  email: string;
  status: string;
  driverStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  profile?: {
    name: string;
    phone: string;
    avatar?: string;
  };
  vehicle?: {
    type: string;
    plateNumber: string;
  };
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  status: string;
  transactionRef: string;
  description?: string;
  createdAt: string;
  userId: string;
  user?: {
    profile?: { name: string };
    email: string;
  };
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