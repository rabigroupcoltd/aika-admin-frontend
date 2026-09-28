import { Link } from 'react-router-dom';
import { Badge, Card, CardHeader } from '@/components/ui';
import { humanise, money } from '@/lib/format';
import type { SupportTicketDetail } from '@/modules/support/type';

type RelatedOrder = NonNullable<SupportTicketDetail['order']>;

interface RelatedOrderCardProps {
  order: RelatedOrder;
}

export function RelatedOrderCard({ order }: RelatedOrderCardProps) {
  return (
    <Card>
      <CardHeader title="Related order" />
      <p className="text-sm text-aiko-dark-800 dark:text-aiko-dark-200">
        {order.pickupLocation}
      </p>
      <p className="text-sm text-aiko-dark-500">→ {order.dropoffLocation}</p>
      <div className="mt-2 flex items-center gap-2">
        <Badge tone="neutral">{humanise(order.status)}</Badge>
        <span className="text-sm font-medium">{money(order.fare, order.currency)}</span>
      </div>
      <Link
        to={`/orders/${order.id}`}
        className="mt-3 inline-block text-sm font-medium text-aiko-green-600 hover:underline">
        Open order →
      </Link>
    </Card>
  );
}
