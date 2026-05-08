import apiClient from '../lib/api-client';
import type {
  User,
  DashboardStats,
  LoginRequest,
  LoginResponse,
  KycApprovalRequest,
  KycApprovalResponse,
  PayoutProcessResponse,
} from '../types';

class ApiService {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<{ data: DashboardStats }>('/dashboard');
    return data.data;
  }

  async getUsers(): Promise<User[]> {
    const { data } = await apiClient.get<{ data: User[] }>('/user');
    return data.data;
  }

  async getPendingKyc(): Promise<User[]> {
    const { data } = await apiClient.get<{ data: User[] }>('/user?driverStatus=PENDING');
    return data.data;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<{ data: LoginResponse }>('/auth/login', credentials);
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
}

export const apiService = new ApiService();