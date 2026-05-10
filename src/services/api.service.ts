import apiClient from '../lib/api-client';
import type {
  User,
  DashboardStats,
  LoginRequest,
  LoginResponse,
  KycApprovalRequest,
  KycApprovalResponse,
  PayoutProcessResponse,
  WalletInfo,
  DashboardAnalytics,
  Order,
  Rider,
  Transaction,
} from '../types';

class ApiService {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<{ data: DashboardStats }>('/dashboard');
    return data.data;
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const { data } = await apiClient.get<{ data: DashboardAnalytics }>('/dashboard/analytics');
    return data.data;
  }


  async getUsers(): Promise<User[]> {
    const { data } = await apiClient.get<{ data: User[] }>('/user');
    return data.data;
  }

  async getUser(id: string): Promise<User> {
    const { data } = await apiClient.get<{ data: User }>(`/user/${id}`);
    return data.data;
  }

  async getPendingKyc(): Promise<User[]> {
    const { data } = await apiClient.get<{ data: User[] }>('/user?driverStatus=PENDING');
    return data.data;
  }

  async getOrders(): Promise<Order[]> {
    const { data } = await apiClient.get<{ data: Order[] }>('/order');
    return data.data;
  }

  async getRiders(): Promise<Rider[]> {
    const { data } = await apiClient.get<{ data: Rider[] }>('/rider');
    return data.data;
  }

  async getTransactions(): Promise<Transaction[]> {
    const { data } = await apiClient.get<{ data: Transaction[] }>('/payments');
    return data.data;
  }



  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<{ data: LoginResponse }>('/auth/signin', credentials);
    return data.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async approveDriver(request: KycApprovalRequest): Promise<KycApprovalResponse> {
    const { data } = await apiClient.patch<KycApprovalResponse>(`/users/${request.userId}/approve-driver`, {
      deviceToken: request.deviceToken,
    });
    return data;
  }

  async processPayouts(): Promise<PayoutProcessResponse> {
    const { data } = await apiClient.post<PayoutProcessResponse>('/payouts/process');
    return data;
  }

  async getPayoutSummary(): Promise<{ pendingPayouts: number; totalAmount: number; processedCount: number; failedCount: number }> {
    const { data } = await apiClient.get<{ data: any }>('/payouts/summary');
    return data.data;
  }


  // Wallet management
  async getUserWallet(userId: string): Promise<WalletInfo> {
    const { data } = await apiClient.get<{ data: WalletInfo }>(`/wallet/${userId}`);
    return data.data;
  }

  async creditWallet(userId: string, amount: number, note?: string): Promise<WalletInfo> {
    const { data } = await apiClient.post<{ data: WalletInfo }>(`/wallet/${userId}/credit`, { amount, note });
    return data.data;
  }

  async debitWallet(userId: string, amount: number, note?: string): Promise<WalletInfo> {
    const { data } = await apiClient.post<{ data: WalletInfo }>(`/wallet/${userId}/debit`, { amount, note });
    return data.data;
  }
}

export const apiService = new ApiService();