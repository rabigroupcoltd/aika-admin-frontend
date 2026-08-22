import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { AxiosInstance, AxiosResponse } from 'axios';
import showToast from '@/components/CustomToastContainer';
import { extractSoftErrorMessage, parseApiError } from '@/utils/parseApiError';
import Axios from './api_management/MyHttpHelper';
import AxiosWithToken from './api_management/MyHttpHelperWithToken';

/** The success envelope every endpoint returns. */
export interface ApiResponse<TData = unknown> {
  /** HTTP status, mirrored into the body. Always < 400 here. */
  code: number;
  message: string;
  data: TData;
}

interface ApiManagerOptions {
  /** A string, or a function of the variables when the id is in the path. */
  endpoint: string | ((details: any) => string);
  /** Invalidated on success. A string or the head of a query key. */
  queryKey?: string | unknown[];
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** False only for sign-in, which has no token yet. */
  isAuth?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  contentType?: string | null;
  /**
   * Strips path-only fields out of the body. Without it, `{ id, isBlocked }`
   * would send the id in both the URL and the payload, and a strict DTO
   * rejects the unexpected property.
   */
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

/**
 * Every mutation in the admin goes through here.
 *
 * It exists so a controller can describe *what* it calls rather than how: the
 * toast on success, the toast on failure, the cache invalidation and the error
 * normalisation are decided once, and a new endpoint is five lines rather than
 * a fresh copy of all four.
 *
 * The one thing it deliberately does not do is decide what a screen renders
 * afterwards. Callers get `isLoading` and `error` back and lay them out
 * themselves — a shared spinner is where a design starts to look generic.
 */
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

    // Insurance only — StatusInterceptor should already have turned a failing
    // envelope into a non-2xx status, which axios rejects before we get here.
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

/**
 * Drops keys that belong in the path, not the body.
 *
 * Constrained to `object` rather than `Record<string, unknown>`: a declared
 * interface has no implicit index signature, so the stricter constraint would
 * reject every variables type in the app.
 */
export function omitKeys<T extends object>(...keys: (keyof T)[]) {
  return (details: T) => {
    const body = { ...details };
    keys.forEach((key) => delete body[key]);
    return body;
  };
}
