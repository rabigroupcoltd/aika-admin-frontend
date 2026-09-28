import { Bike, Package, TrendingDown, TrendingUp, Users as UsersIcon, Wallet } from 'lucide-react';
import { PageHeader, Spinner, cn } from '@/components/ui';
import { money } from '@/lib/format';
import {
  useGetActivityManager,
  useGetAdminSummaryManager,
  useGetOrderTrendManager,
  useGetVehicleSplitManager,
} from '@/modules/admin/adminController';
import { ActionBanner } from './components/ActionBanner';
import { LiveOrdersCard } from './components/LiveOrdersCard';
import { OrdersTrendChart } from './components/OrdersTrendChart';
import { RecentActivityCard } from './components/RecentActivityCard';
import { RevenueBarChart } from './components/RevenueBarChart';
import { StatCard } from './components/StatCard';
import { VehicleSplitChart } from './components/VehicleSplitChart';

export function Dashboard() {
  const summary = useGetAdminSummaryManager();
  const trend = useGetOrderTrendManager({ days: 14 });
  const split = useGetVehicleSplitManager();
  const activity = useGetActivityManager({ limit: 15, refetchInterval: 30_000 });

  if (summary.isLoading) return <Spinner label="Loading dashboard…" />;

  const data = summary.data;
  const change = data?.orders.changePercent ? Number(data.orders.changePercent) : null;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="What is happening on the platform right now."
      />

      {/* Anything that needs a human decision, before the numbers. */}
      {data && (data.drivers.pendingKyc > 0 || data.support.urgent > 0) ? (
        <div className="mb-6 flex flex-wrap gap-3">
          {data.drivers.pendingKyc > 0 ? (
            <ActionBanner
              to="/kyc"
              tone="amber"
              text={`${data.drivers.pendingKyc} driver${data.drivers.pendingKyc === 1 ? '' : 's'} waiting on KYC`}
            />
          ) : null}
          {data.support.urgent > 0 ? (
            <ActionBanner
              to="/support"
              tone="red"
              text={`${data.support.urgent} urgent support ticket${data.support.urgent === 1 ? '' : 's'}`}
            />
          ) : null}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Package}
          label="Orders today"
          value={data?.orders.today ?? 0}
          footer={
            change == null ? (
              <span className="text-aiko-dark-500">No orders yesterday to compare</span>
            ) : (
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-medium',
                  change >= 0 ? 'text-aiko-green-600' : 'text-red-600',
                )}>
                {change >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {Math.abs(change)}% vs yesterday
              </span>
            )
          }
        />
        <StatCard
          icon={Wallet}
          label="Revenue today"
          value={money(data?.revenue.today, data?.revenue.currency)}
          footer={<span className="text-aiko-dark-500">{money(data?.revenue.week)} this week</span>}
        />
        <StatCard
          icon={Bike}
          label="Drivers online"
          value={data?.drivers.online ?? '—'}
          footer={
            <span className="text-aiko-dark-500">
              {data?.drivers.online == null
                ? 'Presence unavailable'
                : `of ${data.drivers.approved} approved`}
            </span>
          }
        />
        <StatCard
          icon={UsersIcon}
          label="Users"
          value={data?.users.total ?? 0}
          footer={
            <span className="text-aiko-green-600">+{data?.users.newThisWeek ?? 0} this week</span>
          }
        />
      </div>

      <LiveOrdersCard liveOrders={data?.liveOrders} />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <OrdersTrendChart data={trend.data} isLoading={trend.isLoading} />
        <VehicleSplitChart data={split.data} isLoading={split.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueBarChart data={trend.data} isLoading={trend.isLoading} />
        <RecentActivityCard items={activity.data} isLoading={activity.isLoading} />
      </div>
    </>
  );
}
