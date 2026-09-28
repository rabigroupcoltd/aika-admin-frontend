import { useState } from 'react';
import { Button, Card, CardHeader, Input } from '@/components/ui';
import { money } from '@/lib/format';
import type { Driver } from '@/modules/drivers/type';

interface DebtCardProps {
  driver: Driver;
  /** Support can see the balance but not touch it — both server-side actions here are admin-only. */
  readOnly?: boolean;
  /** Record-a-payment mutation in flight. */
  paying: boolean;
  /** Set-limit mutation in flight. */
  settingLimit: boolean;
  /**
   * Both callbacks resolve only on success — they rethrow otherwise so the
   * inputs keep their value when the page-level banner takes the error.
   */
  onPay: (amount: number) => Promise<unknown>;
  onSetLimit: (debtLimit: number) => Promise<unknown>;
}

export function DebtCard({ driver, readOnly, paying, settingLimit, onPay, onSetLimit }: DebtCardProps) {
  const [payment, setPayment] = useState('');
  const [newLimit, setNewLimit] = useState('');

  async function handlePay() {
    try {
      await onPay(Number(payment));
      setPayment('');
    } catch {
      /* surfaced upstream */
    }
  }

  async function handleSetLimit() {
    try {
      await onSetLimit(Number(newLimit));
      setNewLimit('');
    } catch {
      /* surfaced upstream */
    }
  }

  return (
    <Card>
      <CardHeader
        title="Debt"
        subtitle="Cash fares owed to the platform. Past the limit, the driver is blocked automatically."
      />
      <div className="mb-4 flex items-baseline gap-2">
        <span
          className={
            driver.currentDebt >= driver.debtLimit
              ? 'text-2xl font-semibold text-red-600'
              : 'text-2xl font-semibold text-aiko-dark-900 dark:text-white'
          }>
          {money(driver.currentDebt)}
        </span>
        <span className="text-sm text-aiko-dark-500">of {money(driver.debtLimit)} limit</span>
      </div>

      {readOnly ? null : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              value={payment}
              onChange={(event) => setPayment(event.target.value)}
              placeholder="Amount paid"
            />
            <Button
              loading={paying}
              disabled={!payment || Number(payment) <= 0}
              onClick={() => void handlePay()}>
              Record
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              value={newLimit}
              onChange={(event) => setNewLimit(event.target.value)}
              placeholder="New limit"
            />
            <Button
              variant="outline"
              loading={settingLimit}
              disabled={!newLimit}
              onClick={() => void handleSetLimit()}>
              Set limit
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
