import { Card, CardHeader } from '@/components/ui';
import type { UserSummary } from '@/modules/orders/type';

interface RequesterCardProps {
  requester?: UserSummary;
}

export function RequesterCard({ requester }: RequesterCardProps) {
  return (
    <Card>
      <CardHeader title="Raised by" />
      <p className="text-sm font-medium text-aiko-dark-900 dark:text-white">
        {requester?.name ?? 'Unknown'}
      </p>
      <p className="text-sm text-aiko-dark-500">{requester?.phone ?? '—'}</p>
    </Card>
  );
}
