import type { VehicleType } from '@/modules/orders/type';

/**
 * Platform-wide figures.
 *
 * "Completed" counts both lanes — the legacy bid flow ends at COMPLETED and the
 * marketplace at DELIVERED, and counting only the first reported zero revenue
 * for the whole pilot.
 */
export interface AnalyticsOverview {
  totalUsers: number;
  totalDrivers: number;
  activeDrivers: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  /** One decimal place, as a string. */
  completionRate: string;
  cancellationRate: string;
  cashRevenue: number;
  transferRevenue: number;
  totalRevenue: number;
  platformEarnings: number;
  /** What drivers still owe on cash fares. */
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
