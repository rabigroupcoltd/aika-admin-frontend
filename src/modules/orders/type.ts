export type VehicleType = 'BIKE' | 'TRICYCLE' | 'CAR' | 'TRUCK' | 'BICYCLE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SEARCHING_FOR_DRIVER'
  | 'RESERVED'
  | 'DRIVER_ARRIVING_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'NO_DRIVER_FOUND';

export interface UserSummary {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  photoUrl?: string | null;
}

export interface OrderDriver {
  id: string;
  vehicleType: VehicleType;
  vehiclePlate: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  user?: UserSummary;
}

export interface Order {
  id: string;
  userId: string;
  driverId: string | null;
  vehicleType: VehicleType;
  description: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  durationMins: number;
  fare: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  platformFee: number;
  driverEarnings: number;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  user?: UserSummary;
  driver?: OrderDriver | null;
}

export interface PagedResponse<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  result: T[];
}

export interface OrderFilterParams {
  status?: OrderStatus | '';
  vehicleType?: string;
  driverId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface CancelOrderVariables {
  id: string;
  reason: string;
}
