import type { AxiosError } from 'axios';

/**
 * The sentence the API actually sent.
 *
 * The error envelope is `{ code, message, error }` where `message` is the
 * category — "NOT FOUND", "CONFLICT" — and `error` is the detail a human needs
 * ("Driver not found"). Reading `message` first would show every failure as its
 * HTTP category, which tells the operator nothing they could act on.
 *
 * Validation failures arrive as an array of strings; the first is the useful one.
 */
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

/**
 * A failure that arrived with a 2xx status.
 *
 * `StatusInterceptor` on the server sets the HTTP status from the envelope's
 * `code`, so this should never fire — but it is one line of insurance against a
 * route that bypasses the interceptor and reports a 409 inside a 200 body.
 * Without it such a response would be rendered as success.
 */
export function extractSoftErrorMessage(body: unknown): string | null {
  const envelope = body as { code?: number; error?: string | string[] } | null;
  if (!envelope || typeof envelope.code !== 'number' || envelope.code < 400) return null;

  const detail = envelope.error;
  if (Array.isArray(detail)) return detail[0] ?? 'Request failed.';
  return typeof detail === 'string' ? detail : 'Request failed.';
}
