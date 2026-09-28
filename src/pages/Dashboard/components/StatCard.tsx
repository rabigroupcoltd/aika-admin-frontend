import type { ComponentType, ReactNode } from 'react';
import { Card } from '@/components/ui';

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  footer?: ReactNode;
}

export function StatCard({ icon: Icon, label, value, footer }: StatCardProps) {
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
