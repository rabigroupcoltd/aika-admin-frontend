import type { VehicleType } from '@/modules/orders/type';

export interface AdminSummary {
  orders: {
    today: number;
    yesterday: number;
    week: number;
    total: number;
    changePercent: string | null;
  };
  revenue: { today: number; week: number; total: number; currency: string };
  drivers: {
    total: number;
    approved: number;
    online: number | null;
    pendingKyc: number;
    blocked: number;
  };
  users: { total: number; newThisWeek: number };
  support: { open: number; pending: number; urgent: number };
  liveOrders: { searching: number; reserved: number; inTransit: number };
}

export interface TrendPoint {
  date: string;
  orders: number;
  delivered: number;
  revenue: number;
}

export interface VehicleSplit {
  vehicleType: VehicleType;
  orders: number;
  revenue: number;
}

export interface ActivityItem {
  type: 'ORDER_COMPLETED' | 'ORDER_CANCELLED' | 'DRIVER_REGISTERED' | 'SUPPORT_TICKET';
  at: string;
  summary: string;
  entityId: string;
  amount: number | null;
}

export interface SocketActivity {
  dispatch: {
    openOrders: number;
    activeTrips: number;
    driversInPool: number;
    poolByVehicle: Record<string, number>;
  };
  orders: {
    id: string;
    vehicleType: VehicleType;
    pickupLocation: string;
    dropoffLocation: string;
    fare: number;
    searchRadiusKm: number | null;
    dispatchAttempts: number;
    createdAt: string;
    ageSeconds: number;
    offeredTo: number;
  }[];
}
