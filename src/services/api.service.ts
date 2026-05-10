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
  QueryParams,
  PaginatedResponse,
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

  async getUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get<{ body: PaginatedResponse<User> }>('/user', { params });
    // Note: The backend structure for /user might return data in 'body' based on user.service logic
    return data.body;
  }

  async getUser(id: string): Promise<User> {
    const { data } = await apiClient.get<{ data: User }>(`/user/${id}`);
    return data.data;
  }

  async getPendingKyc(): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get<{ body: PaginatedResponse<User> }>('/user', { 
        params: { driverStatus: 'PENDING', size: 100 } 
    });
    return data.body;
  }

  async getOrders(params?: QueryParams): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<{ body: PaginatedResponse<Order> }>('/order', { params });
    return data.body;
  }

  async getRiders(params?: QueryParams): Promise<PaginatedResponse<Rider>> {
    const { data } = await apiClient.get<{ body: PaginatedResponse<Rider> }>('/rider', { params });
    return data.body;
  }

  async getTransactions(params?: QueryParams): Promise<PaginatedResponse<Transaction>> {
    const { data } = await apiClient.get<{ body: PaginatedResponse<Transaction> }>('/payments', { params });
    return data.body;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<{ data: LoginResponse }>('/auth/signin', credentials);
    return data.data;
  }

  async logout(): Promise<void> {
    // Some backends use POST /auth/logout, others might just clear tokens on frontend
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API failed, continuing with local cleanup', e);
    }
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