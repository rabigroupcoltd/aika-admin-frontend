import { Card, ErrorState, PageHeader, Spinner } from '@/components/ui';
import { useGetOrderTrendManager } from '@/modules/admin/adminController';
import {
  useGetAnalyticsOverviewManager,
  useGetTopDriversManager,
} from '@/modules/analytics/analyticsController';
import { MoneyStat } from './components/MoneyStat';
import { PaymentMethodsCard } from './components/PaymentMethodsCard';
import { RevenueBarChart } from './components/RevenueBarChart';
import { TopDriversTable } from './components/TopDriversTable';

export function Financials() {
  const overview = useGetAnalyticsOverviewManager();
  const topDrivers = useGetTopDriversManager({ limit: 10 });
  const trend = useGetOrderTrendManager({ days: 30 });

  if (overview.isLoading) return <Spinner label="Loading financials…" />;
  if (overview.isError || !overview.data) {
    return (
      <ErrorState
        message={overview.error?.message ?? 'Could not load financials.'}
        onRetry={overview.refetch}
      />
    );
  }

  const data = overview.data;

  return (
    <>
      <PageHeader
        title="Financials"
        subtitle="Revenue, platform earnings and what drivers still owe."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MoneyStat label="Total revenue" value={data.totalRevenue} hint="Fares on finished deliveries" />
        <MoneyStat
          label="Platform earnings"
          value={data.platformEarnings}
          hint="Commission across all deliveries"
        />
        <MoneyStat
          label="Outstanding debt"
          value={data.outstandingDebt}
          hint="Cash fares drivers still owe"
          warn={data.outstandingDebt > 0}
        />
        <Card>
          <p className="text-sm text-aiko-dark-500">Completion rate</p>
          <p className="mt-1 text-2xl font-semibold text-aiko-dark-900 dark:text-white">
            {data.completionRate}%
          </p>
          <p className="mt-3 text-xs text-aiko-dark-500">
            {data.cancellationRate}% cancelled · {data.totalOrders} orders total
          </p>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <PaymentMethodsCard
          cashRevenue={data.cashRevenue}
          transferRevenue={data.transferRevenue}
          totalRevenue={data.totalRevenue}
        />

        <RevenueBarChart data={trend.data} isLoading={trend.isLoading} />
      </div>

      <TopDriversTable drivers={topDrivers.data ?? []} isLoading={topDrivers.isLoading} />
    </>
  );
}
