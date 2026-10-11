import type { AxiosError } from 'axios';

export function parseApiError(error: unknown): string {
  if (error instanceof Error && !(error as AxiosError).isAxiosError) {
    return error.message;
  }

  const axiosError = error as AxiosError<{ error?: string | string[]; message?: string }>;
  const body = axiosError?.response?.data;

  const detail = body?.error ?? body?.message;
  if (Array.isArray(detail)) return detail[0] ?? 'Something went wrong.';
  if (typeof detail === 'string' && detail.trim()) return detail;

  if (axiosError?.message) return axiosError.message;
  return 'Something went wrong.';
}

export function extractSoftErrorMessage(body: unknown): string | null {
  const envelope = body as { code?: number; error?: string | string[] } | null;
  if (!envelope || typeof envelope.code !== 'number' || envelope.code < 400) return null;

  const detail = envelope.error;
  if (Array.isArray(detail)) return detail[0] ?? 'Request failed.';
  return typeof detail === 'string' ? detail : 'Request failed.';
}
