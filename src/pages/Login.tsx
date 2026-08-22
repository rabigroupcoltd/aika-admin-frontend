import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui';
import { getToken, setToken } from '@/constants/api_management/MyHttpHelperWithToken';
import { SignInManager } from '@/modules/auth/authController';
import { parseApiError } from '@/utils/parseApiError';

/**
 * Staff sign-in.
 *
 * Email and password, not Firebase. App accounts are created through Firebase
 * and carry no password, so they can never authenticate here — which is the
 * point: this endpoint only admits seeded staff.
 */
export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { signIn, isLoading } = SignInManager();

  async function submit() {
    setError(null);

    try {
      const result = await signIn({ email: email.trim(), password });

      // The API refuses non-admins, but a USER token would otherwise be stored
      // and produce a wall of 403s instead of a sentence explaining why.
      if (!result.user.roles?.includes('ADMIN')) {
        setError('That account is not an administrator.');
        return;
      }

      setToken(result.accessToken);
      navigate('/', { replace: true });
    } catch (e) {
      setError(parseApiError(e));
    }
  }

  // Signing in again while already signed in just lands on the dashboard.
  if (getToken()) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-full items-center justify-center bg-aiko-dark-50 p-4 dark:bg-aiko-dark-950">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-aiko-green-500 text-lg font-bold text-white">
            A
          </div>
          <h1 className="text-xl font-semibold text-aiko-dark-900 dark:text-white">Aiko Admin</h1>
          <p className="mt-1 text-sm text-aiko-dark-500">Sign in to continue</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
              Email
            </label>
            <Input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@aiko.ng"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
              Password
            </label>
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <Button type="submit" loading={isLoading} className="w-full">
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
