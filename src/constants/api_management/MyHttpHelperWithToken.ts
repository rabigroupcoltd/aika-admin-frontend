import axios, { type AxiosError } from 'axios';

const TOKEN_KEY = 'aiko-admin-token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    // Private windows and blocked site data throw here rather than returning
    // null, and neither is a reason to crash the app.
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* the session simply will not survive a reload */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to clear */
  }
}

/**
 * Authenticated axios — everything except sign-in.
 *
 * The API answers with `{ code, message, data }` on success and
 * `{ code, message, error }` on failure, and `StatusInterceptor` on the server
 * sets the HTTP status from `code`. That means axios rejects on a business
 * failure exactly as it would on a transport one, so callers need only one
 * error path.
 */
const AxiosWithToken = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

AxiosWithToken.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * A 401 means the token is gone or expired and every subsequent request will
 * fail identically. Clearing it here is what lets the router fall back to the
 * sign-in screen, rather than each screen inventing its own handling for a
 * session that no longer exists.
 *
 * Deliberately narrow: a 403 is a live session without the right role, and
 * signing the admin out for it would hide the actual problem.
 */
AxiosWithToken.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default AxiosWithToken;
