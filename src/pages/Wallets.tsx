import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Spinner,
  Table,
  Td,
  Th,
} from '@/components/ui';
import { money } from '@/lib/format';
import { debtHeadroom, debtLimitOf, isDebtLocked } from '@/modules/drivers/debt';
import { useGetDriversManager } from '@/modules/drivers/driversController';
import { useGetAllWalletsManager } from '@/modules/wallet/walletController';

type View = 'debt' | 'payouts';

export function Wallets() {
  const [view, setView] = useState<View>('debt');

  return (
    <>
      <PageHeader
        title="Wallets & Payouts"
        subtitle="What drivers owe on cash fares, and what they're owed back."
        action={
          <div className="inline-flex rounded-lg border border-aiko-dark-200 p-1 dark:border-aiko-dark-700">
            <Button
              variant={view === 'debt' ? 'primary' : 'ghost'}
              onClick={() => setView('debt')}>
              Debt exposure
            </Button>
            <Button
              variant={view === 'payouts' ? 'primary' : 'ghost'}
              onClick={() => setView('payouts')}>
              Payouts
            </Button>
          </div>
        }
      />

      {view === 'debt' ? <DebtExposureView /> : <PayoutsView />}
    </>
  );
}

function DebtExposureView() {
  const [search, setSearch] = useState('');
  const [onlyOwing, setOnlyOwing] = useState(true);

  const { data, isLoading, isError, error, refetch } = useGetDriversManager();

  const rows = useMemo(() => {
    let list = data ?? [];

    if (onlyOwing) list = list.filter((driver) => driver.currentDebt > 0);

    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter((driver) =>
        [driver.user?.name, driver.user?.phone]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(term)),
      );
    }

    return [...list].sort(
      (a, b) => b.currentDebt / (debtLimitOf(b) || 1) - a.currentDebt / (debtLimitOf(a) || 1),
    );
  }, [data, search, onlyOwing]);

  const totals = useMemo(() => {
    const list = data ?? [];
    return {
      outstanding: list.reduce((sum, driver) => sum + driver.currentDebt, 0),
      owing: list.filter((driver) => driver.currentDebt > 0).length,
      overLimit: list.filter(isDebtLocked).length,
    };
  }, [data]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name or phone"
          className="w-56"
        />
        <label className="flex items-center gap-2 text-sm text-aiko-dark-600 dark:text-aiko-dark-300">
          <input
            type="checkbox"
            checked={onlyOwing}
            onChange={(event) => setOnlyOwing(event.target.checked)}
            className="h-4 w-4 rounded border-aiko-dark-300 accent-aiko-green-500"
          />
          Only drivers owing
        </label>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-aiko-dark-500">Outstanding debt</p>
          <p className="mt-1 text-2xl font-semibold text-aiko-dark-900 dark:text-white">
            {money(totals.outstanding)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-aiko-dark-500">Drivers owing</p>
          <p className="mt-1 text-2xl font-semibold text-aiko-dark-900 dark:text-white">
            {totals.owing}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-aiko-dark-500">Over their limit</p>
          <p
            className={
              totals.overLimit > 0
                ? 'mt-1 text-2xl font-semibold text-red-600'
                : 'mt-1 text-2xl font-semibold text-aiko-dark-900 dark:text-white'
            }>
            {totals.overLimit}
          </p>
          <p className="mt-2 text-xs text-aiko-dark-500">Blocked from taking new work</p>
        </Card>
      </div>

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Loading wallets…" />
        ) : isError ? (
          <ErrorState message={error?.message ?? 'Could not load wallets.'} onRetry={refetch} />
        ) : !rows.length ? (
          <EmptyState
            title={onlyOwing ? 'Nobody owes anything' : 'No drivers match'}
            hint={onlyOwing ? 'Every driver is settled up.' : 'Try a different search.'}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Driver</Th>
                <Th>Debt</Th>
                <Th>Limit</Th>
                <Th>Headroom</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((driver) => {
                const headroom = debtHeadroom(driver);
                const limit = debtLimitOf(driver);
                return (
                  <tr
                    key={driver.id}
                    className="transition-colors hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800/50">
                    <Td>
                      <p className="font-medium">{driver.user?.name ?? 'Unnamed'}</p>
                      <p className="text-xs text-aiko-dark-500">{driver.user?.phone ?? '—'}</p>
                    </Td>
                    <Td className="font-medium">{money(driver.currentDebt)}</Td>
                    <Td className="text-aiko-dark-500">{limit > 0 ? money(limit) : 'No limit'}</Td>
                    <Td
                      className={
                        headroom !== null && headroom <= 0 ? 'font-medium text-red-600' : undefined
                      }>
                      {headroom === null ? '—' : money(headroom)}
                    </Td>
                    <Td>
                      {driver.isBlocked ? (
                        <Badge tone="red">Blocked</Badge>
                      ) : isDebtLocked(driver) ? (
                        <Badge tone="amber">At limit — can't take trips</Badge>
                      ) : (
                        <Badge tone="green">Clear</Badge>
                      )}
                    </Td>
                    <Td>
                      <Link
                        to={`/drivers/${driver.id}`}
                        className="text-sm font-medium text-aiko-green-600 hover:underline">
                        Settle
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}

function PayoutsView() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = useGetAllWalletsManager();

  const rows = useMemo(() => {
    let list = data ?? [];
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter((wallet) =>
        [wallet.driver?.user?.name, wallet.driver?.user?.phone]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(term)),
      );
    }
    return list;
  }, [data, search]);

  const totals = useMemo(() => {
    const list = data ?? [];
    return {
      available: list.reduce((sum, wallet) => sum + wallet.availableBalance, 0),
      pending: list.reduce((sum, wallet) => sum + wallet.pendingBalance, 0),
      earned: list.reduce((sum, wallet) => sum + wallet.totalEarnings, 0),
    };
  }, [data]);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name or phone"
          className="w-56"
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-aiko-dark-500">Available balance (all drivers)</p>
          <p className="mt-1 text-2xl font-semibold text-aiko-dark-900 dark:text-white">
            {money(totals.available)}
          </p>
          <p className="mt-1 text-xs text-aiko-dark-500">What could be withdrawn today.</p>
        </Card>
        <Card>
          <p className="text-sm text-aiko-dark-500">Pending balance</p>
          <p className="mt-1 text-2xl font-semibold text-aiko-dark-900 dark:text-white">
            {money(totals.pending)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-aiko-dark-500">Lifetime earnings</p>
          <p className="mt-1 text-2xl font-semibold text-aiko-dark-900 dark:text-white">
            {money(totals.earned)}
          </p>
        </Card>
      </div>

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Loading wallets…" />
        ) : isError ? (
          <ErrorState message={error?.message ?? 'Could not load wallets.'} onRetry={refetch} />
        ) : !rows.length ? (
          <EmptyState title="No wallets match" hint="Try a different search." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Driver</Th>
                <Th>Available</Th>
                <Th>Pending</Th>
                <Th>Lifetime earned</Th>
                <Th>Withdrawn</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((wallet) => (
                <tr
                  key={wallet.id}
                  className="transition-colors hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800/50">
                  <Td>
                    <p className="font-medium">{wallet.driver?.user?.name ?? 'Unnamed'}</p>
                    <p className="text-xs text-aiko-dark-500">{wallet.driver?.user?.phone ?? '—'}</p>
                  </Td>
                  <Td className="font-medium">{money(wallet.availableBalance)}</Td>
                  <Td className="text-aiko-dark-500">{money(wallet.pendingBalance)}</Td>
                  <Td className="text-aiko-dark-500">{money(wallet.totalEarnings)}</Td>
                  <Td className="text-aiko-dark-500">{money(wallet.totalWithdrawals)}</Td>
                  <Td>
                    <Link
                      to={`/drivers/${wallet.driverId}`}
                      className="text-sm font-medium text-aiko-green-600 hover:underline">
                      View ledger
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <p className="mt-3 text-xs text-aiko-dark-500">
        Full transaction history — earnings, fees, withdrawals, debt payments — is on each
        driver's own page.
      </p>
    </>
  );
}
