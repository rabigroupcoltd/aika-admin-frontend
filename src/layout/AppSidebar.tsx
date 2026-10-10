import {
  BarChart3,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Package,
  RadioTower,
  Settings,
  Tag,
  Users,
  Wallet,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/components/ui';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Rendered as a count pill — open tickets, drivers awaiting KYC. */
  badge?: number;
  /** Hidden from SUPPORT — pricing, wallets, settings, audit, KYC approval. */
  adminOnly?: boolean;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

/**
 * The nav, grouped by what an operator is doing rather than by data model.
 *
 * "Operations" is the daily loop, "Money" is what gets reconciled weekly, and
 * "Platform" is the stuff you touch when something is wrong. A flat list of
 * twelve links makes the daily four harder to find than they should be.
 */
function sections(counts: { pendingKyc?: number; openTickets?: number }): NavSection[] {
  return [
    {
      heading: 'Operations',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/orders', label: 'Orders', icon: Package },
        { to: '/kyc', label: 'KYC Approvals', icon: CheckCircle2, badge: counts.pendingKyc, adminOnly: true },
        { to: '/users', label: 'User Management', icon: Users },
      ],
    },
    {
      heading: 'Money',
      items: [
        { to: '/financials', label: 'Financials', icon: BarChart3, adminOnly: true },
        { to: '/wallets', label: 'Wallets & Payouts', icon: Wallet, adminOnly: true },
        { to: '/pricing', label: 'Pricing & Rate Card', icon: Tag, adminOnly: true },
      ],
    },
    {
      heading: 'Platform',
      items: [
        { to: '/support', label: 'Support', icon: LifeBuoy, badge: counts.openTickets },
        { to: '/dispatch', label: 'Dispatch Activity', icon: RadioTower, adminOnly: true },
        { to: '/audit', label: 'Audit Logs', icon: FileText, adminOnly: true },
        { to: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
      ],
    },
  ];
}

export function AppSidebar({
  open,
  isAdmin,
  counts,
}: {
  open: boolean;
  /** SUPPORT gets the same sections with the admin-only items filtered out, not a different layout. */
  isAdmin: boolean;
  counts: { pendingKyc?: number; openTickets?: number };
}) {
  const visibleSections = sections(counts)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isAdmin || !item.adminOnly),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r transition-transform duration-200',
        'border-aiko-dark-200 bg-white dark:border-aiko-dark-800 dark:bg-aiko-dark-950',
        'lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
      <div className="flex h-16 items-center gap-2 border-b border-aiko-dark-200 px-6 dark:border-aiko-dark-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aiko-green-500 text-sm font-bold text-white">
          A
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-aiko-dark-900 dark:text-white">
            Aiko
          </p>
          <p className="text-xs leading-tight text-aiko-dark-500">Admin</p>
        </div>
      </div>

      <nav className="h-[calc(100%-4rem)] space-y-6 overflow-y-auto px-3 py-5">
        {visibleSections.map((section) => (
          <div key={section.heading}>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-aiko-dark-400">
              {section.heading}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  // `end` only on the dashboard: without it the root route
                  // matches every path and every link renders as active.
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-aiko-green-500 text-white'
                        : 'text-aiko-dark-600 hover:bg-aiko-green-50 hover:text-aiko-green-700 dark:text-aiko-dark-300 dark:hover:bg-aiko-dark-800 dark:hover:text-white',
                    )
                  }>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
