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

interface ApiResponseWrapper<T> {
  statusCode: number;
  message: string;
  data: T;
}

class ApiService {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<ApiResponseWrapper<DashboardStats>>('/dashboard');
    return data.data;
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const { data } = await apiClient.get<ApiResponseWrapper<DashboardAnalytics>>('/dashboard/analytics');
    return data.data;
  }

  async getUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get<ApiResponseWrapper<PaginatedResponse<User>>>('/user', { params });
    return data.data;
  }

  async getUser(id: string): Promise<User> {
    const { data } = await apiClient.get<ApiResponseWrapper<User>>(`/user/${id}`);
    return data.data;
  }

  async getPendingKyc(): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get<ApiResponseWrapper<PaginatedResponse<User>>>('/user', { 
        params: { driverStatus: 'PENDING', size: 100 } 
    });
    return data.data;
  }

  async getOrders(params?: QueryParams): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<ApiResponseWrapper<PaginatedResponse<Order>>>('/order', { params });
    return data.data;
  }

  async getRiders(params?: QueryParams): Promise<PaginatedResponse<Rider>> {
    const { data } = await apiClient.get<ApiResponseWrapper<PaginatedResponse<Rider>>>('/rider', { params });
    return data.data;
  }

  async getTransactions(params?: QueryParams): Promise<PaginatedResponse<Transaction>> {
    const { data } = await apiClient.get<ApiResponseWrapper<PaginatedResponse<Transaction>>>('/payments', { params });
    return data.data;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponseWrapper<LoginResponse>>('/auth/signin', credentials);
    return data.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API failed, continuing with local cleanup', e);
    }
  }

  async approveDriver(request: KycApprovalRequest): Promise<KycApprovalResponse> {
    const { data } = await apiClient.patch<ApiResponseWrapper<KycApprovalResponse>>(`/users/${request.userId}/approve-driver`, {
      deviceToken: request.deviceToken,
    });
    return data.data;
  }

  async processPayouts(): Promise<PayoutProcessResponse> {
    const { data } = await apiClient.post<ApiResponseWrapper<PayoutProcessResponse>>('/payouts/process');
    return data.data;
  }

  async getPayoutSummary(): Promise<{ pendingPayouts: number; totalAmount: number; processedCount: number; failedCount: number }> {
    const { data } = await apiClient.get<ApiResponseWrapper<any>>('/payouts/summary');
    return data.data;
  }

  // Wallet management
  async getUserWallet(userId: string): Promise<WalletInfo> {
    const { data } = await apiClient.get<ApiResponseWrapper<WalletInfo>>(`/wallet/${userId}`);
    return data.data;
  }

  async creditWallet(userId: string, amount: number, note?: string): Promise<WalletInfo> {
    const { data } = await apiClient.post<ApiResponseWrapper<WalletInfo>>(`/wallet/${userId}/credit`, { amount, note });
    return data.data;
  }

  async debitWallet(userId: string, amount: number, note?: string): Promise<WalletInfo> {
    const { data } = await apiClient.post<ApiResponseWrapper<WalletInfo>>(`/wallet/${userId}/debit`, { amount, note });
    return data.data;
  }
}

export const apiService = new ApiService();