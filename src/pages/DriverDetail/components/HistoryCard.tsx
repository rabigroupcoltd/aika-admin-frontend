import { Card, CardHeader } from '@/components/ui';
import { dateTime } from '@/lib/format';
import type { AuditLog } from '@/modules/audit/type';

interface HistoryCardProps {
  history?: AuditLog[];
}

export function HistoryCard({ history }: HistoryCardProps) {
  return (
    <Card>
      <CardHeader title="Admin history" subtitle="Every action staff have taken here." />
      {!history?.length ? (
        <p className="text-sm text-aiko-dark-500">Nothing recorded yet.</p>
      ) : (
        <ul className="divide-y divide-aiko-dark-100 dark:divide-aiko-dark-800">
          {history.map((entry) => (
            <li key={entry.id} className="py-3">
              <p className="text-sm text-aiko-dark-800 dark:text-aiko-dark-200">
                {entry.summary}
              </p>
              <p className="text-xs text-aiko-dark-500">
                {entry.actorName ?? 'System'} · {dateTime(entry.createdAt)}
              </p>
              {entry.metadata && 'reason' in entry.metadata ? (
                <p className="mt-1 text-xs italic text-aiko-dark-500">
                  “{String(entry.metadata.reason)}”
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
