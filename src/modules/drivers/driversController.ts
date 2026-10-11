import { useQuery } from '@tanstack/react-query';
import AxiosWithToken from '@/constants/api_management/MyHttpHelperWithToken';
import useApiManager, { omitKeys, type ApiResponse } from '@/constants/mainController';
import { parseApiError } from '@/utils/parseApiError';
import type {
  BlockDriverVariables,
  DebtLimitVariables,
  Driver,
  DriverFilterParams,
  IncompleteApplication,
  PayDebtVariables,
  RejectKycVariables,
} from './type';

export const DRIVERS_QUERY_KEY = 'drivers';

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

export const useGetIncompleteApplicationsManager = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [DRIVERS_QUERY_KEY, 'incomplete-applications'],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get<ApiResponse<IncompleteApplication[]>>(
          '/drivers/applications/incomplete',
        );
        return response.data.data;
      } catch (error) {
        throw new Error(parseApiError(error));
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

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
