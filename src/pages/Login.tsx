import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useLoginMutation } from '../hooks/useApiQueries';
import { AikaLogo } from '../components/AikaLogo';
import { Button } from '../components/ui';
import type { LoginResponse } from '../types';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  // Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      navigate('/app', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

loginMutation.mutate(
        { username, password },
        {
          onSuccess: (data: LoginResponse) => {
            localStorage.setItem('admin_token', data.accessToken);
            navigate('/app');
          },
        }
      );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-aiko-green-500 via-aiko-dark-600 to-aiko-dark-900 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-aiko-green-400 opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-aiko-dark-400 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="bg-white dark:bg-aiko-dark-800 rounded-2xl p-3 md:p-4 shadow-2xl">
            <AikaLogo className="w-40 md:w-48" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-aiko-dark-900 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-aiko-dark-900 dark:text-white mb-2">
            Login
          </h2>
          <p className="text-center text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8">
            Access the Aiko admin dashboard
          </p>

          {/* Error Alert */}
          {loginMutation.isError && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-red-800 dark:text-red-200">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : 'Login failed. Please try again.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 md:py-2.5 border border-gray-300 dark:border-aiko-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-aiko-green-500 dark:bg-aiko-dark-800 dark:text-white text-sm"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 md:py-2.5 border border-gray-300 dark:border-aiko-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-aiko-green-500 dark:bg-aiko-dark-800 dark:text-white text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs md:text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-aiko-green-500 focus:ring-aiko-green-500"
                />
                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-aiko-green-600 dark:text-aiko-green-400 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full text-sm md:text-base py-2 md:py-3"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6 md:mt-8">
            Aiko Admin Portal • Secure login required
          </p>
        </div>

        {/* Demo Credentials Note */}
        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20">
          {/* <p className="text-xs md:text-sm text-white text-center">
            Demo credentials available on request. Contact your administrator.
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;