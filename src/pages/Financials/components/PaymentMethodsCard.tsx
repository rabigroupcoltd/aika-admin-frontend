import { Card, CardHeader } from '@/components/ui';
import { money } from '@/lib/format';

interface PaymentMethodsCardProps {
  cashRevenue: number;
  transferRevenue: number;
  totalRevenue: number;
}

export function PaymentMethodsCard({
  cashRevenue,
  transferRevenue,
  totalRevenue,
}: PaymentMethodsCardProps) {
  return (
    <Card>
      <CardHeader title="How customers pay" />
      <div className="space-y-3">
        <PaymentSplit label="Cash" amount={cashRevenue} total={totalRevenue} tone="bg-aiko-green-500" />
        <PaymentSplit
          label="Bank transfer"
          amount={transferRevenue}
          total={totalRevenue}
          tone="bg-aiko-green-300"
        />
      </div>
      <p className="mt-4 text-xs text-aiko-dark-500">
        Cash is what creates driver debt — the driver collects it and owes the platform its
        commission.
      </p>
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
