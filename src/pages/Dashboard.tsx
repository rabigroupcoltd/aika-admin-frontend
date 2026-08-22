import {
  AlertTriangle,
  Bike,
  Package,
  TrendingDown,
  TrendingUp,
  Users as UsersIcon,
  Wallet,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge, Card, CardHeader, EmptyState, PageHeader, Spinner, cn } from '@/components/ui';
import { money, relative } from '@/lib/format';
import {
  useGetActivityManager,
  useGetAdminSummaryManager,
  useGetOrderTrendManager,
  useGetVehicleSplitManager,
} from '@/modules/admin/adminController';

/**
 * Brand-derived series colours.
 *
 * Two greens and two neutrals rather than a rainbow: every chart on this page
 * shows at most three series, and a categorical palette wide enough for ten
 * would make three look arbitrary.
 */
const SERIES = ['#3DB74A', '#7DD9B5', '#6B7280', '#D1D5DB'];

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
        <Stat
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
        <Stat
          icon={Wallet}
          label="Revenue today"
          value={money(data?.revenue.today, data?.revenue.currency)}
          footer={<span className="text-aiko-dark-500">{money(data?.revenue.week)} this week</span>}
        />
        <Stat
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
        <Stat
          icon={UsersIcon}
          label="Users"
          value={data?.users.total ?? 0}
          footer={
            <span className="text-aiko-green-600">+{data?.users.newThisWeek ?? 0} this week</span>
          }
        />
      </div>

      {/* Live order pipeline — the three states an operator can act on. */}
      <Card className="mb-6">
        <CardHeader
          title="Live orders"
          subtitle="Right now, across the marketplace."
          action={
            <Link to="/dispatch" className="text-sm font-medium text-aiko-green-600 hover:underline">
              Dispatch activity →
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Pipeline
            label="Searching"
            value={data?.liveOrders.searching ?? 0}
            tone={data?.liveOrders.searching ? 'amber' : 'neutral'}
            hint="On the market, unclaimed"
          />
          <Pipeline
            label="Reserved"
            value={data?.liveOrders.reserved ?? 0}
            tone="blue"
            hint="Driver assigned, not collected"
          />
          <Pipeline
            label="In transit"
            value={data?.liveOrders.inTransit ?? 0}
            tone="green"
            hint="Parcel is moving"
          />
        </div>
      </Card>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Orders" subtitle="Last 14 days" />
          {trend.isLoading ? (
            <Spinner />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.data ?? []} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => value.slice(5)}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 13 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Placed"
                    stroke={SERIES[0]}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="delivered"
                    name="Delivered"
                    stroke={SERIES[1]}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="By vehicle" subtitle="All time" />
          {split.isLoading ? (
            <Spinner />
          ) : !split.data?.length ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={split.data}
                    dataKey="orders"
                    nameKey="vehicleType"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}>
                    {split.data.map((_, index) => (
                      <Cell key={index} fill={SERIES[index % SERIES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 13 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Revenue" subtitle="Delivered orders, last 14 days" />
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
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
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
                  <Bar dataKey="revenue" name="Revenue" fill={SERIES[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent activity" subtitle="Newest first" />
          {activity.isLoading ? (
            <Spinner />
          ) : !activity.data?.length ? (
            <EmptyState title="Nothing has happened yet" />
          ) : (
            <ul className="divide-y divide-aiko-dark-100 dark:divide-aiko-dark-800">
              {activity.data.map((item, index) => (
                <li key={`${item.entityId}-${index}`} className="flex items-start gap-3 py-3">
                  <span
                    className={cn(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      item.type === 'ORDER_COMPLETED' && 'bg-aiko-green-500',
                      item.type === 'ORDER_CANCELLED' && 'bg-red-500',
                      item.type === 'DRIVER_REGISTERED' && 'bg-blue-500',
                      item.type === 'SUPPORT_TICKET' && 'bg-amber-500',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-aiko-dark-800 dark:text-aiko-dark-200">
                      {item.summary}
                    </p>
                    <p className="text-xs text-aiko-dark-500">{relative(item.at)}</p>
                  </div>
                  {item.amount != null ? (
                    <span className="shrink-0 text-sm font-medium text-aiko-green-600">
                      {money(item.amount)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  footer,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-aiko-dark-500">{label}</p>
          <p className="mt-1 truncate text-2xl font-semibold text-aiko-dark-900 dark:text-white">
            {value}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aiko-green-50 text-aiko-green-600 dark:bg-aiko-green-900/30">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {footer ? <p className="mt-3 text-xs">{footer}</p> : null}
    </Card>
  );
}

function Pipeline({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone: 'amber' | 'blue' | 'green' | 'neutral';
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-aiko-dark-200 p-4 dark:border-aiko-dark-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">{label}</p>
        <Badge tone={tone}>{value}</Badge>
      </div>
      <p className="mt-1 text-xs text-aiko-dark-500">{hint}</p>
    </div>
  );
}

function ActionBanner({
  to,
  text,
  tone,
}: {
  to: string;
  text: string;
  tone: 'amber' | 'red';
}) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
        tone === 'red'
          ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200'
          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-200',
      )}>
      <AlertTriangle className="h-4 w-4" />
      {text}
      <span aria-hidden>→</span>
    </Link>
  );
}
