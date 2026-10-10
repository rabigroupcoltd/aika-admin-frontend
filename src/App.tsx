import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layout/AppLayout';
import { AuditLogs } from '@/pages/AuditLogs';
import { Dashboard } from '@/pages/Dashboard';
import { DispatchActivity } from '@/pages/DispatchActivity';
import { DriverRedirect } from '@/pages/DriverRedirect';
import { Financials } from '@/pages/Financials';
import { KycApprovals } from '@/pages/KycApprovals';
import { Login } from '@/pages/Login';
import { OrderDetail } from '@/pages/OrderDetail';
import { Orders } from '@/pages/Orders';
import { Pricing } from '@/pages/Pricing';
import { Settings } from '@/pages/Settings';
import { Support } from '@/pages/Support';
import { SupportDetail } from '@/pages/SupportDetail';
import { UserDetail } from '@/pages/UserDetail';
import { UserManagement } from '@/pages/UserManagement';
import { Wallets } from '@/pages/Wallets';
import { CustomToastContainer } from '@/components/CustomToastContainer';
import { getToken } from '@/constants/api_management/MyHttpHelperWithToken';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Admin data is read far more often than it changes, and an operator
      // switching between screens should not re-fetch everything each time.
      staleTime: 30_000,
      // A 401 is terminal — the interceptor has already cleared the session and
      // redirected, so retrying only delays the sign-in screen.
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Gate for everything behind sign-in.
 *
 * Checks for a token rather than for a validated session: the API is the real
 * authority, and a token that has expired produces a 401 on the first query,
 * which the axios interceptor turns into a redirect. Verifying here as well
 * would mean an extra round trip before every screen to answer a question the
 * next request answers anyway.
 */
function RequireAuth() {
  return getToken() ? <Outlet /> : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />

              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              {/* Drivers live under user management now; old links still land. */}
              <Route path="drivers" element={<Navigate to="/users?tab=drivers" replace />} />
              <Route path="drivers/:id" element={<DriverRedirect />} />
              <Route path="kyc" element={<KycApprovals />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:id" element={<UserDetail />} />

              <Route path="financials" element={<Financials />} />
              <Route path="wallets" element={<Wallets />} />
              <Route path="pricing" element={<Pricing />} />

              <Route path="support" element={<Support />} />
              <Route path="support/:id" element={<SupportDetail />} />
              <Route path="dispatch" element={<DispatchActivity />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      {/* One host for every toast useApiManager raises. */}
      <CustomToastContainer />
    </QueryClientProvider>
  );
}
