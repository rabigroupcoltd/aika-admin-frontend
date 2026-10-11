import { useState } from 'react';
import { Badge, Button, Card, CardHeader, ErrorState, Spinner } from '@/components/ui';
import { dateTime, money } from '@/lib/format';
import { useGetWalletTransactionsManager } from '@/modules/wallet/walletController';
import type { TransactionType } from '@/modules/wallet/type';

const TYPE_LABEL: Record<TransactionType, string> = {
  RIDE_EARNINGS: 'Earnings',
  PLATFORM_FEE: 'Platform fee',
  WITHDRAWAL: 'Withdrawal',
  DEBT_PAYMENT: 'Debt payment',
  ADJUSTMENT: 'Adjustment',
};

const TYPE_TONE: Record<TransactionType, 'green' | 'amber' | 'blue' | 'neutral'> = {
  RIDE_EARNINGS: 'green',
  PLATFORM_FEE: 'neutral',
  WITHDRAWAL: 'blue',
  DEBT_PAYMENT: 'amber',
  ADJUSTMENT: 'neutral',
};

const PAGE_SIZE = 20;

interface WalletLedgerCardProps {
  driverId: string;
}

export function WalletLedgerCard({ driverId }: WalletLedgerCardProps) {
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, error, refetch } = useGetWalletTransactionsManager({
    driverId,
    limit: PAGE_SIZE,
    offset,
  });

  const shown = data?.result ?? [];
  const totalItems = data?.totalItems ?? 0;
  const from = totalItems === 0 ? 0 : offset + 1;
  const to = Math.min(offset + PAGE_SIZE, totalItems);

  return (
    <Card>
      <CardHeader title="Wallet ledger" subtitle="Every balance movement, newest first." />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState message={error?.message ?? 'Could not load the ledger.'} onRetry={refetch} />
      ) : !shown.length ? (
        <p className="text-sm text-aiko-dark-500">No transactions yet.</p>
      ) : (
        <>
          <ul className="divide-y divide-aiko-dark-100 dark:divide-aiko-dark-800">
            {shown.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone={TYPE_TONE[entry.type]}>{TYPE_LABEL[entry.type]}</Badge>
                    <span className="text-xs text-aiko-dark-500">{dateTime(entry.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-aiko-dark-700 dark:text-aiko-dark-300">
                    {entry.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={
                      entry.amount < 0
                        ? 'font-medium text-red-600'
                        : 'font-medium text-aiko-green-600'
                    }>
                    {entry.amount < 0 ? '-' : '+'}
                    {money(Math.abs(entry.amount))}
                  </p>
                  <p className="text-xs text-aiko-dark-500">Balance {money(entry.balanceAfter)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-aiko-dark-500">
              {from}–{to} of {totalItems}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={to >= totalItems}
                onClick={() => setOffset(offset + PAGE_SIZE)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
