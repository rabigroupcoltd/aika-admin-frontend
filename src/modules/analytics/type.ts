import type { VehicleType } from '@/modules/orders/type';

export interface AnalyticsOverview {
  totalUsers: number;
  totalDrivers: number;
  activeDrivers: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  completionRate: string;
  cancellationRate: string;
  cashRevenue: number;
  transferRevenue: number;
  totalRevenue: number;
  platformEarnings: number;
  outstandingDebt: number;
}

export interface TopDriver {
  id: string;
  name: string | null;
  vehicleType: VehicleType;
  totalTrips: number;
  totalEarnings: number;
  rating: number | null;
}
