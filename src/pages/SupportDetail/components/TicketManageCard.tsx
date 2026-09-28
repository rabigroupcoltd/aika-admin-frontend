import { Card, CardHeader, Select } from '@/components/ui';
import { humanise } from '@/lib/format';
import { SUPPORT_PRIORITIES, SUPPORT_STATUSES } from '@/modules/support/supportController';
import type { SupportPriority, SupportStatus } from '@/modules/support/type';

interface TicketManageCardProps {
  status: SupportStatus;
  priority: SupportPriority;
  onUpdate: (patch: { status?: SupportStatus; priority?: SupportPriority }) => Promise<void>;
}

export function TicketManageCard({ status, priority, onUpdate }: TicketManageCardProps) {
  return (
    <Card>
      <CardHeader title="Manage" />
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
            Status
          </label>
          <Select
            className="w-full"
            value={status}
            onChange={(event) => void onUpdate({ status: event.target.value as SupportStatus })}>
            {SUPPORT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {humanise(value)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
            Priority
          </label>
          <Select
            className="w-full"
            value={priority}
            onChange={(event) => void onUpdate({ priority: event.target.value as SupportPriority })}>
            {SUPPORT_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {humanise(value)}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Card>
  );
}
