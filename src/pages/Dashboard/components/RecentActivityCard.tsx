import { Card, CardHeader, EmptyState, Spinner, cn } from '@/components/ui';
import { money, relative } from '@/lib/format';
import type { ActivityItem } from '@/modules/admin/type';

interface RecentActivityCardProps {
  items?: ActivityItem[];
  isLoading: boolean;
}

export function RecentActivityCard({ items, isLoading }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader title="Recent activity" subtitle="Newest first" />
      {isLoading ? (
        <Spinner />
      ) : !items?.length ? (
        <EmptyState title="Nothing has happened yet" />
      ) : (
        <ul className="divide-y divide-aiko-dark-100 dark:divide-aiko-dark-800">
          {items.map((item, index) => (
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
  );
}
