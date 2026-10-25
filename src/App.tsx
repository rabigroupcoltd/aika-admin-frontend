import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
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
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { Settings } from '@/pages/Settings';
import { Support } from '@/pages/Support';
import { SupportDetail } from '@/pages/SupportDetail';
import { UserDetail } from '@/pages/UserDetail';
import { UserManagement } from '@/pages/UserManagement';
import { Wallets } from '@/pages/Wallets';
import { CustomToastContainer } from '@/components/CustomToastContainer';
import { Spinner } from '@/components/ui';
import { getToken } from '@/constants/api_management/MyHttpHelperWithToken';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

function RequireAuth() {
  return getToken() ? <Outlet /> : <Navigate to="/login" replace />;
}

const LiveMap = lazy(() => import('@/pages/LiveMap').then((m) => ({ default: m.LiveMap })));

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />

              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="drivers" element={<Navigate to="/users?tab=drivers" replace />} />
              <Route path="drivers/:id" element={<DriverRedirect />} />
              <Route path="kyc" element={<KycApprovals />} />
              <Route
                path="live-map"
                element={
                  <Suspense fallback={<Spinner label="Loading map…" />}>
                    <LiveMap />
                  </Suspense>
                }
              />
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
      <CustomToastContainer />
    </QueryClientProvider>
  );
}
