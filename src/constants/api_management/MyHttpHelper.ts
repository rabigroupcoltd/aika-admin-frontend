import axios from 'axios';

/**
 * Unauthenticated axios.
 *
 * Only sign-in uses it. Kept separate from the token instance so a request that
 * runs before there is a session cannot accidentally inherit a stale
 * Authorization header, and so the 401 redirect below never fires on the login
 * screen itself.
 */
const Axios = axios.create({
  // Relative in development: Vite proxies /api to the NestJS server, which
  // means no CORS setup and the same code path in both environments.
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

export default Axios;
