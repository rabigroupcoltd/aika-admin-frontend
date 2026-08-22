import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';

// ============================================
// TypeScript Interfaces
// ============================================

export type VehicleType = 'BIKE' | 'TRICYCLE' | 'CAR' | 'TRUCK' | 'BICYCLE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

/**
 * Both lanes share one enum.
 *
 * The legacy bid lane runs PENDING → ACCEPTED → ARRIVED → IN_PROGRESS →
 * COMPLETED; the marketplace lane runs SEARCHING_FOR_DRIVER → RESERVED →
 * DRIVER_ARRIVING_PICKUP → PICKED_UP → IN_TRANSIT → DELIVERED. Historical
 * orders carry the first set, so neither can be dropped from the union.
 */
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
  /** What the customer is sending. Null on orders raised before the field existed. */
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

/**
 * The paging envelope the older controllers return.
 *
 * Not `{ data, meta }` — `ResponsesService.pagingData` produces these four keys
 * and the rows live under `result`. Getting it wrong renders an empty table
 * rather than failing to compile, so it is named exactly rather than adapted.
 */
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

export const ORDERS_QUERY_KEY = 'orders';

// ============================================
// QUERY CONTROLLERS
// ============================================

export const useGetOrdersManager = ({
  status,
  vehicleType,
  driverId,
  userId,
  page = 1,
  limit = 25,
  enabled = true,
}: OrderFilterParams & { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, 'list', status, vehicleType, driverId, userId, page, limit],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<PagedResponse<Order>>>('/orders', {
          params: {
            page,
            limit,
            ...(status && { status }),
            ...(vehicleType && { vehicleType }),
            ...(driverId && { driverId }),
            ...(userId && { userId }),
          },
        });
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useGetOrderByIdManager = ({
  orderId,
  enabled = true,
}: {
  orderId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, orderId],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<Order>>(`/orders/${orderId}`);
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled: enabled && Boolean(orderId),
    refetchOnWindowFocus: false,
  });
};

// ============================================
// MUTATION CONTROLLERS
// ============================================

/**
 * Cancel an order.
 *
 * The reason reaches both parties and is written to the audit trail, which is
 * why the screen refuses to send an empty one — an order nobody can explain
 * later is the one that turns into a dispute.
 */
export const CancelOrderManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    Order,
    Error,
    CancelOrderVariables
  >({
    endpoint: ({ id }: CancelOrderVariables) => `/orders/${id}/cancel`,
    getBody: omitKeys<CancelOrderVariables>('id'),
    // The dashboard tiles count live orders, so they move too.
    queryKey: [ORDERS_QUERY_KEY],
    method: 'POST',
    showSuccessToast: true,
  });

  const cancelOrder = async (details: CancelOrderVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { cancelOrder, data, isLoading, isSuccess, isError, error };
};
