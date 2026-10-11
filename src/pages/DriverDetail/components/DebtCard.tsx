import { useState } from 'react';
import { Badge, Button, Card, CardHeader, Input } from '@/components/ui';
import { money } from '@/lib/format';
import type { Driver } from '@/modules/drivers/type';

interface DebtCardProps {
  driver: Driver;
  readOnly?: boolean;
  paying: boolean;
  settingLimit: boolean;
  onPay: (amount: number) => Promise<unknown>;
  onSetLimit: (debtLimit: number | null) => Promise<unknown>;
}

export function DebtCard({ driver, readOnly, paying, settingLimit, onPay, onSetLimit }: DebtCardProps) {
  const [payment, setPayment] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const debt = driver.debt;
  const owed = driver.currentDebt;
  const locked = Boolean(debt?.locked);

  async function pay(amount: number) {
    try {
      await onPay(amount);
      setPayment('');
    } catch {
    }
  }

  async function setLimit(value: number | null) {
    try {
      await onSetLimit(value);
      setNewLimit('');
    } catch {
    }
  }

  return (
    <Card>
      <CardHeader
        title="Commission owed"
        subtitle="Platform commission from cash trips. Once it reaches the limit, the driver can't take new trips until you record their payment."
      />

      <div className="mb-1 flex flex-wrap items-baseline gap-2">
        <span
          className={
            locked
              ? 'text-2xl font-semibold text-red-600'
              : 'text-2xl font-semibold text-aiko-dark-900 dark:text-white'
          }>
          {money(owed)}
        </span>
        <span className="text-sm text-aiko-dark-500">
          {debt && debt.limit > 0 ? `of ${money(debt.limit)} limit` : 'no limit'}
        </span>
        {locked ? <Badge tone="red">Can't take trips</Badge> : null}
      </div>
      <p className="mb-4 text-xs text-aiko-dark-500">
        {debt?.isOverride
          ? 'This driver has their own limit.'
          : 'Using the platform-wide limit from Settings.'}
      </p>

      {readOnly ? null : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input
              type="number"
              min={1}
              value={payment}
              onChange={(event) => setPayment(event.target.value)}
              placeholder="Amount paid"
              className="min-w-0 flex-1"
            />
            <Button
              loading={paying}
              disabled={!payment || Number(payment) <= 0}
              onClick={() => void pay(Number(payment))}>
              Record payment
            </Button>
            <Button
              variant="outline"
              loading={paying}
              disabled={owed <= 0}
              onClick={() => {
                if (window.confirm(`Record a payment of ${money(owed)} and clear this driver's balance?`)) {
                  void pay(owed);
                }
              }}>
              Clear full balance
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Input
              type="number"
              min={0}
              value={newLimit}
              onChange={(event) => setNewLimit(event.target.value)}
              placeholder="Custom limit for this driver"
              className="min-w-0 flex-1"
            />
            <Button
              variant="outline"
              loading={settingLimit}
              disabled={newLimit === '' || Number(newLimit) < 0}
              onClick={() => void setLimit(Number(newLimit))}>
              Set limit
            </Button>
            {debt?.isOverride ? (
              <Button variant="ghost" loading={settingLimit} onClick={() => void setLimit(null)}>
                Use platform limit
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}
