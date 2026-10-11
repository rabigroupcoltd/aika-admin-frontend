import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { AxiosInstance, AxiosResponse } from 'axios';
import showToast from '@/components/CustomToastContainer';
import { extractSoftErrorMessage, parseApiError } from '@/utils/parseApiError';
import Axios from './api_management/MyHttpHelper';
import AxiosWithToken from './api_management/MyHttpHelperWithToken';

export interface ApiResponse<TData = unknown> {
  code: number;
  message: string;
  data: TData;
}

interface ApiManagerOptions {
  endpoint: string | ((details: any) => string);
  queryKey?: string | unknown[];
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  isAuth?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  contentType?: string | null;
  getBody?: (details: any) => unknown;
}

interface ApiManagerReturn<TData, TError, TVariables> {
  callApi: (details: TVariables) => Promise<ApiResponse<TData>>;
  data: TData | undefined;
  response: ApiResponse<TData> | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  error: TError | null;
  isError: boolean;
  mutation: UseMutationResult<ApiResponse<TData>, TError, TVariables>;
}

const useApiManager = <TData = unknown, TError = Error, TVariables = unknown>({
  endpoint,
  queryKey,
  method = 'POST',
  isAuth = true,
  showSuccessToast = false,
  showErrorToast = true,
  contentType = 'application/json',
  getBody,
}: ApiManagerOptions): ApiManagerReturn<TData, TError, TVariables> => {
  const queryClient = useQueryClient();
  const axiosInstance: AxiosInstance = isAuth ? AxiosWithToken : Axios;

  const apiController = async (details: TVariables): Promise<ApiResponse<TData>> => {
    const url = typeof endpoint === 'function' ? endpoint(details) : endpoint;
    const body = getBody ? getBody(details) : details;
    const config = { headers: contentType ? { 'Content-Type': contentType } : undefined };

    let response: AxiosResponse<ApiResponse<TData>>;

    switch (method) {
      case 'POST':
        response = await axiosInstance.post(url, body, config);
        break;
      case 'PUT':
        response = await axiosInstance.put(url, body, config);
        break;
      case 'PATCH':
        response = await axiosInstance.patch(url, body, config);
        break;
      case 'DELETE':
        response = await axiosInstance.delete(url, { ...config, data: body });
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    const softError = extractSoftErrorMessage(response.data);
    if (softError) throw new Error(softError);

    return response.data;
  };

  const mutation = useMutation<ApiResponse<TData>, TError, TVariables>({
    mutationFn: apiController,
    onSuccess: (response) => {
      if (showSuccessToast && response.message) showToast.success(response.message);

      if (queryKey) {
        void queryClient.invalidateQueries({
          queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
        });
      }
    },
    onError: (error) => {
      if (showErrorToast) showToast.error(parseApiError(error));
    },
  });

  return {
    callApi: (details: TVariables) => mutation.mutateAsync(details),
    data: mutation.data?.data,
    response: mutation.data,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    isError: mutation.isError,
    mutation,
  };
};

export default useApiManager;

export function omitKeys<T extends object>(...keys: (keyof T)[]) {
  return (details: T) => {
    const body = { ...details };
    keys.forEach((key) => delete body[key]);
    return body;
  };
}
