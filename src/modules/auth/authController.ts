import useApiManager from '@/constants/mainController';

// ============================================
// TypeScript Interfaces
// ============================================

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  photoUrl?: string | null;
  roles: string[];
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResult {
  accessToken: string;
  user: AdminUser;
}

// ============================================
// MUTATION CONTROLLERS
// ============================================

/**
 * Staff sign-in.
 *
 * `isAuth: false` — this is the one call made before a token exists, so it goes
 * through the plain axios instance rather than the one that attaches an
 * Authorization header and redirects on 401.
 *
 * Email and password, not Firebase: app accounts are created through Firebase
 * and carry no password, so they can never authenticate here. That is the
 * point — this endpoint only admits seeded staff.
 */
export const SignInManager = () => {
  const { callApi, data, isLoading, isSuccess, isError, error } = useApiManager<
    SignInResult,
    Error,
    SignInPayload
  >({
    endpoint: '/auth/login',
    method: 'POST',
    isAuth: false,
    // The screen shows the failure inline under the form; a toast in the corner
    // for a form the user is looking at is the wrong place for it.
    showErrorToast: false,
  });

  const signIn = async (details: SignInPayload) => {
    const result = await callApi(details);
    return result.data;
  };

  return { signIn, data, isLoading, isSuccess, isError, error };
};
