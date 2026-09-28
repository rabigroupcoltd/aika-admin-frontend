import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, ErrorState, PageHeader, Spinner } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { kycTone, shortDate } from '@/lib/format';
import { useGetEntityHistoryManager } from '@/modules/audit/auditController';
import { useGetCurrentAdminManager } from '@/modules/auth/authController';
import {
  ApproveKycManager,
  BlockDriverManager,
  PayDriverDebtManager,
  RejectKycManager,
  UpdateDebtLimitManager,
  useGetDriverByIdManager,
} from '@/modules/drivers/driversController';
import { parseApiError } from '@/utils/parseApiError';
import { BlockCard } from './components/BlockCard';
import { DebtCard } from './components/DebtCard';
import { HistoryCard } from './components/HistoryCard';
import { KycApprovalCard } from './components/KycApprovalCard';
import { KycRejectionCard } from './components/KycRejectionCard';
import { ProfileCard } from './components/ProfileCard';
import { WalletLedgerCard } from './components/WalletLedgerCard';

export function DriverDetail() {
  const { id = '' } = useParams();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: driver, isLoading, isError, error, refetch } = useGetDriverByIdManager({
    driverId: id,
  });

  const { data: history, refetch: refetchHistory } = useGetEntityHistoryManager({
    entity: 'DRIVER',
    entityId: id,
  });

  // KYC approval, blocking and debt actions are admin-only on the server —
  // support can still see everything on this page, just not act on it, so
  // the cards render read-only instead of showing a button that would 403.
  const { data: currentAdmin } = useGetCurrentAdminManager();
  const isAdmin = Boolean(currentAdmin?.roles.includes('ADMIN'));

  const { approveKyc, isLoading: approving } = ApproveKycManager();
  const { rejectKyc, isLoading: rejecting } = RejectKycManager();
  const { blockDriver, isLoading: blocking } = BlockDriverManager();
  const { payDebt, isLoading: payingDebt } = PayDriverDebtManager();
  const { updateDebtLimit, isLoading: settingLimit } = UpdateDebtLimitManager();

  /**
   * Every action here shares one wrapper.
   *
   * The controllers invalidate the driver list themselves, but the audit trail
   * on this page is keyed per-entity and the manager cannot know that — so it
   * is refetched explicitly. Without it the history panel silently omits the
   * action the operator just took, which reads as the action not having worked.
   *
   * The wrapper rethrows after surfacing the error so action panels can tell
   * success from failure (and keep their inputs on failure).
   */
  async function run(action: () => Promise<unknown>) {
    setActionError(null);

    try {
      await action();
      void refetchHistory();
    } catch (e) {
      setActionError(parseApiError(e));
      throw e;
    }
  }

  if (isLoading) return <Spinner label="Loading driver…" />;
  if (isError || !driver) {
    return (
      <ErrorState message={error?.message ?? 'Could not load this driver.'} onRetry={refetch} />
    );
  }

  return (
    <>
      <Link
        to="/drivers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-aiko-dark-500 hover:text-aiko-green-600">
        <ArrowLeft className="h-4 w-4" />
        Back to drivers
      </Link>

      <PageHeader
        title={driver.user?.name ?? 'Driver'}
        subtitle={`${driver.vehicleType}${driver.vehiclePlate ? ` · ${driver.vehiclePlate}` : ''} · joined ${shortDate(driver.createdAt)}`}
        action={
          <div className="flex gap-2">
            <Badge tone={kycTone(driver.kycStatus)}>{driver.kycStatus}</Badge>
            {driver.isBlocked ? <Badge tone="red">Blocked</Badge> : null}
          </div>
        }
      />

      {actionError ? (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ProfileCard driver={driver} />
          <DebtCard
            driver={driver}
            readOnly={!isAdmin}
            paying={payingDebt}
            settingLimit={settingLimit}
            onPay={(amount) => run(() => payDebt({ id, amount }))}
            onSetLimit={(debtLimit) => run(() => updateDebtLimit({ id, debtLimit }))}
          />
          <WalletLedgerCard driverId={id} />
          <HistoryCard history={history} />
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            {driver.kycStatus !== 'APPROVED' ? (
              <KycApprovalCard loading={approving} onApprove={() => run(() => approveKyc(id))} />
            ) : null}

            {driver.kycStatus !== 'REJECTED' ? (
              <KycRejectionCard
                loading={rejecting}
                onReject={(reason) => run(() => rejectKyc({ id, reason }))}
              />
            ) : null}

            <BlockCard
              isBlocked={driver.isBlocked}
              loading={blocking}
              onToggle={() => run(() => blockDriver({ id, isBlocked: !driver.isBlocked }))}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
