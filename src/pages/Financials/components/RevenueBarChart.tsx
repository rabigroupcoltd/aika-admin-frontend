import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, Spinner } from '@/components/ui';
import { money } from '@/lib/format';
import type { TrendPoint } from '@/modules/admin/type';

interface RevenueBarChartProps {
  data?: TrendPoint[];
  isLoading: boolean;
}

export function RevenueBarChart({ data, isLoading }: RevenueBarChartProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader title="Revenue" subtitle="Last 30 days" />
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data ?? []} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
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
  );
}
