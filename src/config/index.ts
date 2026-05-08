/**
 * Application Configuration
 * Centralized configuration for the entire application
 */

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Aika Admin',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  DASHBOARD: {
    STATS: '/dashboard',
  },
  USERS: {
    LIST: '/user',
    GET: (id: string) => `/user/${id}`,
    UPDATE: (id: string) => `/user/${id}`,
    DELETE: (id: string) => `/user/${id}`,
  },
  KYC: {
    PENDING: '/user?driverStatus=PENDING',
    APPROVE: (userId: string) => `/users/${userId}/approve-driver`,
  },
  PAYOUTS: {
    PROCESS: '/payouts/process',
    HISTORY: '/payouts/history',
  },
  NOTIFICATIONS: {
    SAVE_FCM_TOKEN: '/notifications/fcm-token',
  },
};

/**
 * Query Stale Times (in milliseconds)
 */
export const STALE_TIMES = {
  DASHBOARD: 1000 * 60 * 5, // 5 minutes
  USERS: 1000 * 60 * 5, // 5 minutes
  KYC: 1000 * 60 * 2, // 2 minutes
  PAYOUTS: 1000 * 60 * 10, // 10 minutes
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'admin_token',
  THEME: 'aiko-theme',
  FCM_TOKEN: 'aiko-fcm-token',
  USER_PREFERENCES: 'aiko-user-prefs',
};

/**
 * Notification Messages
 */
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Successfully logged in!',
    DRIVER_APPROVED: 'Driver approved successfully!',
    PAYOUT_PROCESSED: 'Payouts processed successfully!',
  },
  ERROR: {
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    NETWORK_ERROR: 'Network error. Please try again.',
    UNAUTHORIZED: 'Your session has expired. Please login again.',
    APPROVE_FAILED: 'Failed to approve driver. Please try again.',
  },
};

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
