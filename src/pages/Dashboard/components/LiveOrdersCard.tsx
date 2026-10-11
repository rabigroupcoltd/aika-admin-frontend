import { Link } from 'react-router-dom';
import { Badge, Card, CardHeader } from '@/components/ui';
import type { AdminSummary } from '@/modules/admin/type';

interface LiveOrdersCardProps {
  liveOrders?: AdminSummary['liveOrders'];
}

export function LiveOrdersCard({ liveOrders }: LiveOrdersCardProps) {
  return (
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
          value={liveOrders?.searching ?? 0}
          tone={liveOrders?.searching ? 'amber' : 'neutral'}
          hint="On the market, unclaimed"
        />
        <Pipeline
          label="Reserved"
          value={liveOrders?.reserved ?? 0}
          tone="blue"
          hint="Driver assigned, not collected"
        />
        <Pipeline
          label="In transit"
          value={liveOrders?.inTransit ?? 0}
          tone="green"
          hint="Parcel is moving"
        />
      </div>
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
