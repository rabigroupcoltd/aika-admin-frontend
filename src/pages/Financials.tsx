import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
  Table,
  Td,
  Th,
} from '@/components/ui';
import { money } from '@/lib/format';
import { useGetOrderTrendManager } from '@/modules/admin/adminController';
import {
  useGetAnalyticsOverviewManager,
  useGetTopDriversManager,
} from '@/modules/analytics/analyticsController';

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
  const drivers = topDrivers.data ?? [];

  return (
    <>
      <PageHeader
        title="Financials"
        subtitle="Revenue, platform earnings and what drivers still owe."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Money label="Total revenue" value={data.totalRevenue} hint="Fares on finished deliveries" />
        <Money
          label="Platform earnings"
          value={data.platformEarnings}
          hint="Commission across all deliveries"
        />
        <Money
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
        <Card>
          <CardHeader title="How customers pay" />
          <div className="space-y-3">
            <PaymentSplit
              label="Cash"
              amount={data.cashRevenue}
              total={data.totalRevenue}
              tone="bg-aiko-green-500"
            />
            <PaymentSplit
              label="Bank transfer"
              amount={data.transferRevenue}
              total={data.totalRevenue}
              tone="bg-aiko-green-300"
            />
          </div>
          <p className="mt-4 text-xs text-aiko-dark-500">
            Cash is what creates driver debt — the driver collects it and owes the platform its
            commission.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Revenue" subtitle="Last 30 days" />
          {trend.isLoading ? (
            <Spinner />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend.data ?? []} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => value.slice(5)}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) => `${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => money(value)}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 13 }}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#3DB74A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader title="Top drivers" subtitle="By trips completed" />
        </div>
        {topDrivers.isLoading ? (
          <Spinner />
        ) : !drivers.length ? (
          <EmptyState title="No driver earnings yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Driver</Th>
                <Th>Vehicle</Th>
                <Th>Trips</Th>
                <Th>Earned</Th>
                <Th>Rating</Th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <Td className="font-medium">{driver.name ?? 'Unnamed'}</Td>
                  <Td>{driver.vehicleType}</Td>
                  <Td>{driver.totalTrips}</Td>
                  <Td className="font-medium">{money(driver.totalEarnings)}</Td>
                  <Td>{driver.rating != null ? driver.rating.toFixed(1) : '—'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}

function Money({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: number;
  hint: string;
  warn?: boolean;
}) {
  return (
    <Card>
      <p className="text-sm text-aiko-dark-500">{label}</p>
      <p
        className={
          warn
            ? 'mt-1 text-2xl font-semibold text-red-600'
            : 'mt-1 text-2xl font-semibold text-aiko-dark-900 dark:text-white'
        }>
        {money(value)}
      </p>
      <p className="mt-3 text-xs text-aiko-dark-500">{hint}</p>
    </Card>
  );
}

function PaymentSplit({
  label,
  amount,
  total,
  tone,
}: {
  label: string;
  amount: number;
  total: number;
  tone: string;
}) {
  // Guard the divide: a platform with no revenue yet is the normal state on
  // day one, and NaN% is a worse answer than 0%.
  const percent = total > 0 ? Math.round((amount / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-aiko-dark-700 dark:text-aiko-dark-200">{label}</span>
        <span className="font-medium text-aiko-dark-900 dark:text-white">{money(amount)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-aiko-dark-100 dark:bg-aiko-dark-800">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-aiko-dark-500">{percent}% of revenue</p>
    </div>
  );
}
