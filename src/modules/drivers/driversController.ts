import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type {
  BlockDriverVariables,
  DebtLimitVariables,
  Driver,
  DriverFilterParams,
  PayDebtVariables,
  RejectKycVariables,
} from './type';

export const DRIVERS_QUERY_KEY = 'drivers';

// ============================================
// QUERY CONTROLLERS
// ============================================

/**
 * The fleet.
 *
 * Not paginated server-side — the endpoint returns the whole filtered set in
 * one array, which is why the screens search it client-side. Fine at pilot
 * scale; worth a server-side `q` once the fleet outgrows one response.
 */
export const useGetDriversManager = ({
  vehicleType,
  kycStatus,
  isAvailable,
  enabled = true,
}: DriverFilterParams & { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [DRIVERS_QUERY_KEY, 'list', vehicleType, kycStatus, isAvailable],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<Driver[]>>('/drivers', {
          params: {
            ...(vehicleType && { vehicleType }),
            ...(kycStatus && { kycStatus }),
            ...(isAvailable !== undefined && { isAvailable }),
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

export const useGetDriverByIdManager = ({
  driverId,
  enabled = true,
}: {
  driverId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [DRIVERS_QUERY_KEY, driverId],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<Driver>>(`/drivers/${driverId}`);
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled: enabled && Boolean(driverId),
    refetchOnWindowFocus: false,
  });
};

// ============================================
// MUTATION CONTROLLERS
// ============================================

/**
 * Approve KYC — the one action that lets a driver go online.
 *
 * Invalidates the admin summary as well as the driver list, because the
 * pending-KYC badge in the sidebar is counted from it and would otherwise keep
 * advertising work that is already done.
 */
export const ApproveKycManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    Driver,
    Error,
    { id: string }
  >({
    endpoint: ({ id }: { id: string }) => `/drivers/${id}/kyc/approve`,
    getBody: () => ({}),
    queryKey: [DRIVERS_QUERY_KEY],
    method: 'PATCH',
    showSuccessToast: true,
  });

  const approveKyc = async (id: string) => {
    const result = await callApi({ id });
    return result.data;
  };

  return { approveKyc, data, isLoading, isSuccess, isError, error };
};

/** Reject KYC. The reason is shown to the driver and recorded in the trail. */
export const RejectKycManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    Driver,
    Error,
    RejectKycVariables
  >({
    endpoint: ({ id }: RejectKycVariables) => `/drivers/${id}/kyc/reject`,
    getBody: omitKeys<RejectKycVariables>('id'),
    queryKey: [DRIVERS_QUERY_KEY],
    method: 'PATCH',
    showSuccessToast: true,
  });

  const rejectKyc = async (details: RejectKycVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { rejectKyc, data, isLoading, isSuccess, isError, error };
};

/** Block or unblock. Blocking removes the driver from the dispatch pool at once. */
export const BlockDriverManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    Driver,
    Error,
    BlockDriverVariables
  >({
    endpoint: ({ id }: BlockDriverVariables) => `/drivers/${id}/block`,
    getBody: omitKeys<BlockDriverVariables>('id'),
    queryKey: [DRIVERS_QUERY_KEY],
    method: 'PATCH',
    showSuccessToast: true,
  });

  const blockDriver = async (details: BlockDriverVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { blockDriver, data, isLoading, isSuccess, isError, error };
};

/** Record a cash repayment. Clears the block once back under the limit. */
export const PayDriverDebtManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    unknown,
    Error,
    PayDebtVariables
  >({
    endpoint: ({ id }: PayDebtVariables) => `/drivers/${id}/pay-debt`,
    getBody: omitKeys<PayDebtVariables>('id'),
    queryKey: [DRIVERS_QUERY_KEY],
    method: 'POST',
    showSuccessToast: true,
  });

  const payDebt = async (details: PayDebtVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { payDebt, data, isLoading, isSuccess, isError, error };
};

export const UpdateDebtLimitManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    Driver,
    Error,
    DebtLimitVariables
  >({
    endpoint: ({ id }: DebtLimitVariables) => `/drivers/${id}/debt-limit`,
    getBody: omitKeys<DebtLimitVariables>('id'),
    queryKey: [DRIVERS_QUERY_KEY],
    method: 'PATCH',
    showSuccessToast: true,
  });

  const updateDebtLimit = async (details: DebtLimitVariables) => {
    const result = await callApi(details);
    return result.data;
  };

  return { updateDebtLimit, data, isLoading, isSuccess, isError, error };
};
