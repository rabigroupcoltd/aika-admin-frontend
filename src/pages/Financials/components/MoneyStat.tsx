import { Card } from '@/components/ui';
import { money } from '@/lib/format';

interface MoneyStatProps {
  label: string;
  value: number;
  hint: string;
  /** Turns the figure red — used when the number is a problem, not a win. */
  warn?: boolean;
}

export function MoneyStat({ label, value, hint, warn }: MoneyStatProps) {
  return (
    <Card>
      <p className="text-sm text-aiko-dark-500">{label}</p>
      <p
        className={
          warn
            ? 'mt-1 text-2xl font-semibold text-red-600'
            : 'mt-1 text-2xl font-semibold text-aiko-dark-900 dark:text-white'
        }>
        {money(value)}
      </p>
      <p className="mt-3 text-xs text-aiko-dark-500">{hint}</p>
    </Card>
  );
}
