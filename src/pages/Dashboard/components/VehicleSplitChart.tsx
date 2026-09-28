import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, EmptyState, Spinner } from '@/components/ui';
import type { VehicleSplit } from '@/modules/admin/type';
import { SERIES } from './chartSeries';

interface VehicleSplitChartProps {
  data?: VehicleSplit[];
  isLoading: boolean;
}

export function VehicleSplitChart({ data, isLoading }: VehicleSplitChartProps) {
  return (
    <Card>
      <CardHeader title="By vehicle" subtitle="All time" />
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState title="No orders yet" />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="orders"
                nameKey="vehicleType"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}>
                {data.map((_, index) => (
                  <Cell key={index} fill={SERIES[index % SERIES.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
