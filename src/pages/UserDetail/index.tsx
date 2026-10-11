import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge, Button, ErrorState, Spinner, cn } from '@/components/ui';
import { money, relative, shortDate } from '@/lib/format';
import { useGetEntityHistoryManager } from '@/modules/audit/auditController';
import { useGetCurrentAdminManager } from '@/modules/auth/authController';
import {
  ApproveKycManager,
  BlockDriverManager,
  PayDriverDebtManager,
  RejectKycManager,
  UpdateDebtLimitManager,
} from '@/modules/drivers/driversController';
import { BlockUserManager, useGetUserOverviewManager } from '@/modules/users/usersController';
import type { DriverApproval, UserOverview } from '@/modules/users/type';
import { parseApiError } from '@/utils/parseApiError';
import { DebtCard } from '../DriverDetail/components/DebtCard';
import { HistoryCard } from '../DriverDetail/components/HistoryCard';
import { WalletLedgerCard } from '../DriverDetail/components/WalletLedgerCard';
import { ProfileSide } from './components/ProfileSide';
import { TripsTab } from './components/TripsTab';
import { VehicleTab } from './components/VehicleTab';
import { VerificationTab } from './components/VerificationTab';

const APPROVAL: Record<DriverApproval, { label: string; tone: 'green' | 'amber' | 'red' | 'neutral' }> = {
  NOT_SUBMITTED: { label: 'Documents not submitted', tone: 'neutral' },
  PENDING: { label: 'Pending review', tone: 'amber' },
  APPROVED: { label: 'Approved driver', tone: 'green' },
  REJECTED: { label: 'Rejected', tone: 'red' },
};

type TabKey = 'verification' | 'trips' | 'vehicle' | 'wallet' | 'activity';

export function UserDetail() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: user, isLoading, isError, error, refetch } = useGetUserOverviewManager({
    userId: id,
  });

  const { data: currentAdmin } = useGetCurrentAdminManager();
  const isAdmin = Boolean(currentAdmin?.roles.includes('ADMIN'));

  const driverId = user?.driver?.id ?? '';
  const { data: driverHistory, refetch: refetchDriverHistory } = useGetEntityHistoryManager({
    entity: 'DRIVER',
    entityId: driverId,
    enabled: Boolean(driverId),
  });
  const { data: userHistory, refetch: refetchUserHistory } = useGetEntityHistoryManager({
    entity: 'USER',
    entityId: id,
  });

  const { approveKyc, isLoading: approving } = ApproveKycManager();
  const { rejectKyc, isLoading: rejecting } = RejectKycManager();
  const { blockDriver, isLoading: blockingDriver } = BlockDriverManager();
  const { blockUser, isLoading: blockingUser } = BlockUserManager();
  const { payDebt, isLoading: paying } = PayDriverDebtManager();
  const { updateDebtLimit, isLoading: settingLimit } = UpdateDebtLimitManager();

  async function run(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
      void refetch();
      void refetchUserHistory();
      if (driverId) void refetchDriverHistory();
    } catch (e) {
      setActionError(parseApiError(e));
      throw e;
    }
  }
  const fire = (action: () => Promise<unknown>) => void run(action).catch(() => {});

  if (isLoading) return <Spinner label="Loading user…" />;
  if (isError || !user) {
    return <ErrorState message={error?.message ?? 'Could not load this user.'} onRetry={refetch} />;
  }

  const isDriverSide = user.driverStatus !== null;
  const isStaff = user.roles.includes('ADMIN') || user.roles.includes('SUPPORT');

  const tabs: { key: TabKey; label: string }[] = isDriverSide
    ? [
        { key: 'verification', label: 'Verification' },
        { key: 'trips', label: 'Trips' },
        { key: 'vehicle', label: 'Vehicle' },
        { key: 'wallet', label: 'Wallet & commission' },
        { key: 'activity', label: 'Activity' },
      ]
    : [
        { key: 'trips', label: 'Trips' },
        { key: 'activity', label: 'Activity' },
      ];

  const active = (tabs.find((t) => t.key === params.get('t'))?.key ?? tabs[0].key) as TabKey;
  const history = [...(driverHistory ?? []), ...(userHistory ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <Link
        to={`/users?tab=${isStaff ? 'staff' : isDriverSide ? 'drivers' : 'passengers'}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-aiko-dark-500 hover:text-aiko-green-600">
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      <Header
        user={user}
        isAdmin={isAdmin}
        approving={approving}
        blocking={blockingUser}
        onApprove={driverId ? () => fire(() => approveKyc(driverId)) : undefined}
        onToggleBlock={() => {
          if (user.isBlocked || window.confirm('Block this account? They will be signed out at once.')) {
            fire(() => blockUser({ id: user.id, isBlocked: !user.isBlocked }));
          }
        }}
        onReview={() => setParams({ t: 'verification' })}
      />

      {actionError ? (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {actionError}
        </div>
      ) : null}

      <Stats user={user} />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ProfileSide user={user} />
        </div>

        <div className="lg:col-span-8">
          <div className="rounded-xl border border-aiko-dark-100 bg-white dark:border-aiko-dark-800 dark:bg-aiko-dark-900">
            <div className="flex gap-1 overflow-x-auto border-b border-aiko-dark-100 px-3 pt-3 dark:border-aiko-dark-800">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setParams({ t: t.key })}
                  className={cn(
                    '-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                    active === t.key
                      ? 'border-aiko-green-500 text-aiko-green-600 dark:text-aiko-green-400'
                      : 'border-transparent text-aiko-dark-500 hover:text-aiko-dark-800 dark:hover:text-white',
                  )}>
                  {t.label}
                  {t.key === 'verification' && user.driverStatus === 'PENDING' ? (
                    <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" />
                  ) : null}
                </button>
              ))}
            </div>

            <div className="space-y-4 p-4">
              {active === 'verification' ? (
                <VerificationTab
                  user={user}
                  isAdmin={isAdmin}
                  approving={approving}
                  rejecting={rejecting}
                  onApprove={() => run(() => approveKyc(driverId))}
                  onReject={(reason) => run(() => rejectKyc({ id: driverId, reason }))}
                />
              ) : null}

              {active === 'trips' ? (
                <TripsTab userId={user.id} driverId={user.driver?.id ?? null} />
              ) : null}

              {active === 'vehicle' ? <VehicleTab user={user} /> : null}

              {active === 'wallet' && user.driver ? (
                <>
                  <WalletSummary user={user} />
                  <DebtCard
                    driver={user.driver}
                    readOnly={!isAdmin}
                    paying={paying}
                    settingLimit={settingLimit}
                    onPay={(amount) => run(() => payDebt({ id: driverId, amount }))}
                    onSetLimit={(debtLimit) => run(() => updateDebtLimit({ id: driverId, debtLimit }))}
                  />
                  <WalletLedgerCard driverId={driverId} />
                  {isAdmin ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-aiko-dark-100 p-4 dark:border-aiko-dark-800">
                      <div>
                        <p className="text-sm font-medium text-aiko-dark-900 dark:text-white">
                          {user.driver.isBlocked ? 'Driving is suspended' : 'Suspend driving'}
                        </p>
                        <p className="text-xs text-aiko-dark-500">
                          Stops new trips without blocking the account — they can still book as a
                          passenger.
                        </p>
                      </div>
                      <Button
                        variant={user.driver.isBlocked ? 'primary' : 'danger'}
                        loading={blockingDriver}
                        onClick={() =>
                          fire(() => blockDriver({ id: driverId, isBlocked: !user.driver!.isBlocked }))
                        }>
                        {user.driver.isBlocked ? 'Resume driving' : 'Suspend driving'}
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : null}
              {active === 'wallet' && !user.driver ? (
                <p className="text-sm text-aiko-dark-500">
                  No wallet yet — it is created when their documents are submitted.
                </p>
              ) : null}

              {active === 'activity' ? <HistoryCard history={history} /> : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Header({
  user,
  isAdmin,
  approving,
  blocking,
  onApprove,
  onToggleBlock,
  onReview,
}: {
  user: UserOverview;
  isAdmin: boolean;
  approving: boolean;
  blocking: boolean;
  onApprove?: () => void;
  onToggleBlock: () => void;
  onReview: () => void;
}) {
  const photo = user.profilePhotoUrl ?? user.photoUrl;
  const approval = user.driverStatus ? APPROVAL[user.driverStatus] : null;
  const role = user.roles.includes('ADMIN')
    ? 'Admin'
    : user.roles.includes('SUPPORT')
      ? 'Support'
      : user.driverStatus
        ? 'Driver'
        : 'Passenger';

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-aiko-dark-100 bg-white p-5 dark:border-aiko-dark-800 dark:bg-aiko-dark-900">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-aiko-green-100 text-xl font-semibold text-aiko-green-700 dark:bg-aiko-green-900/40 dark:text-aiko-green-300">
          {photo ? (
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : (
            (user.name ?? '?').slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-aiko-dark-900 dark:text-white">
            {user.name ?? 'Unnamed'}
          </h1>
          <p className="text-sm text-aiko-dark-500">
            {role} · joined {shortDate(user.createdAt)}
            {user.lastLoginAt ? ` · seen ${relative(user.lastLoginAt)}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {approval ? <Badge tone={approval.tone}>{approval.label}</Badge> : null}
            {user.isBlocked ? <Badge tone="red">Account blocked</Badge> : null}
            {user.driver?.isBlocked ? <Badge tone="red">Driving suspended</Badge> : null}
            {user.driver?.debt?.locked ? <Badge tone="amber">Debt limit reached</Badge> : null}
            {user.driver?.isAvailable ? <Badge tone="green">Online</Badge> : null}
          </div>
        </div>
      </div>

      {isAdmin ? (
        <div className="flex flex-wrap gap-2">
          {user.driverStatus === 'PENDING' && onApprove ? (
            <>
              <Button variant="outline" onClick={onReview}>
                Review documents
              </Button>
              <Button loading={approving} onClick={onApprove}>
                Approve driver
              </Button>
            </>
          ) : null}
          <Button variant={user.isBlocked ? 'outline' : 'danger'} loading={blocking} onClick={onToggleBlock}>
            {user.isBlocked ? 'Unblock account' : 'Block account'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Stats({ user }: { user: UserOverview }) {
  const { passenger, driver } = user.stats;
  const tiles = driver
    ? [
        { label: 'Trips driven', value: String(driver.completed), hint: `${driver.trips} assigned` },
        { label: 'Driver earnings', value: money(driver.earnings) },
        { label: 'Commission generated', value: money(driver.commission) },
        {
          label: 'Commission owed',
          value: money(user.driver?.currentDebt ?? 0),
          hint:
            user.driver?.debt && user.driver.debt.limit > 0
              ? `limit ${money(user.driver.debt.limit)}`
              : 'no limit',
          alert: Boolean(user.driver?.debt?.locked),
        },
        { label: 'Rating', value: (user.driver?.rating ?? 0).toFixed(1) },
      ]
    : [
        { label: 'Trips booked', value: String(passenger.trips) },
        { label: 'Completed', value: String(passenger.completed) },
        { label: 'Total spent', value: money(passenger.spent) },
      ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-xl border border-aiko-dark-100 bg-white p-4 dark:border-aiko-dark-800 dark:bg-aiko-dark-900">
          <p className="text-xs text-aiko-dark-500">{tile.label}</p>
          <p
            className={cn(
              'mt-1 text-lg font-semibold',
              'alert' in tile && tile.alert ? 'text-red-600' : 'text-aiko-dark-900 dark:text-white',
            )}>
            {tile.value}
          </p>
          {'hint' in tile && tile.hint ? <p className="text-xs text-aiko-dark-400">{tile.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

function WalletSummary({ user }: { user: UserOverview }) {
  const wallet = user.driver?.wallet;
  if (!wallet) return null;

  const rows = [
    { label: 'Available balance', value: wallet.availableBalance },
    { label: 'Total earnings', value: wallet.totalEarnings },
    { label: 'Total withdrawn', value: wallet.totalWithdrawals },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-lg bg-aiko-dark-50 p-3 dark:bg-aiko-dark-800/60">
          <p className="text-xs text-aiko-dark-500">{row.label}</p>
          <p className="mt-0.5 font-semibold text-aiko-dark-900 dark:text-white">{money(row.value)}</p>
        </div>
      ))}
    </div>
  );
}
