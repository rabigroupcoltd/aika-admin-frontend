import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { clearToken } from '@/constants/api_management/MyHttpHelperWithToken';
import { useGetAdminSummaryManager } from '@/modules/admin/adminController';
import { useGetCurrentAdminManager } from '@/modules/auth/authController';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const { data: summary } = useGetAdminSummaryManager({ refetchInterval: 60_000 });

  const { data: currentAdmin } = useGetCurrentAdminManager();
  const isAdmin = Boolean(currentAdmin?.roles.includes('ADMIN'));

  function signOut() {
    clearToken();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-full bg-aiko-dark-50 dark:bg-aiko-dark-950">
      {sidebarOpen ? (
        <button
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}

      <AppSidebar
        open={sidebarOpen}
        isAdmin={isAdmin}
        counts={{
          pendingKyc: summary?.drivers.pendingKyc,
          openTickets: summary?.support.open,
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            'flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 lg:px-6',
            'border-aiko-dark-200 bg-white dark:border-aiko-dark-800 dark:bg-aiko-dark-900',
          )}>
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-aiko-dark-600 hover:bg-aiko-dark-100 lg:hidden dark:text-aiko-dark-300 dark:hover:bg-aiko-dark-800">
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center gap-4">
            {summary ? (
              <div className="hidden items-center gap-4 text-sm md:flex">
                <HeaderStat label="Searching" value={summary.liveOrders.searching} warn />
                <HeaderStat label="In transit" value={summary.liveOrders.inTransit} />
                <HeaderStat
                  label="Drivers online"
                  value={summary.drivers.online ?? '—'}
                />
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-lg p-2 text-aiko-dark-600 hover:bg-aiko-dark-100 dark:text-aiko-dark-300 dark:hover:bg-aiko-dark-800">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="rounded-lg p-2 text-aiko-dark-600 hover:bg-aiko-dark-100 dark:text-aiko-dark-300 dark:hover:bg-aiko-dark-800">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function HeaderStat({
  label,
  value,
  warn,
}: {
  label: string;
  value: number | string;
  warn?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          warn && Number(value) > 0 ? 'bg-amber-500' : 'bg-aiko-green-500',
        )}
      />
      <span className="font-semibold text-aiko-dark-900 dark:text-white">{value}</span>
      <span className="text-aiko-dark-500">{label}</span>
    </span>
  );
}
