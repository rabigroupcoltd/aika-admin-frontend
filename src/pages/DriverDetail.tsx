import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Input,
  PageHeader,
  Spinner,
} from '@/components/ui';
import { dateTime, kycTone, money, shortDate } from '@/lib/format';
import { useGetEntityHistoryManager } from '@/modules/audit/auditController';
import {
  ApproveKycManager,
  BlockDriverManager,
  PayDriverDebtManager,
  RejectKycManager,
  UpdateDebtLimitManager,
  useGetDriverByIdManager,
} from '@/modules/drivers/driversController';
import { parseApiError } from '@/utils/parseApiError';

export function DriverDetail() {
  const { id = '' } = useParams();
  const [rejectReason, setRejectReason] = useState('');
  const [debtPayment, setDebtPayment] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: driver, isLoading, isError, error, refetch } = useGetDriverByIdManager({
    driverId: id,
  });

  const { data: history, refetch: refetchHistory } = useGetEntityHistoryManager({
    entity: 'DRIVER',
    entityId: id,
  });

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
   */
  async function run(action: () => Promise<unknown>, onDone?: () => void) {
    setActionError(null);

    try {
      await action();
      void refetchHistory();
      onDone?.();
    } catch (e) {
      setActionError(parseApiError(e));
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
          <Card>
            <CardHeader title="Profile" />
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" value={driver.user?.phone ?? '—'} />
              <Field label="Email" value={driver.user?.email ?? '—'} />
              <Field label="Vehicle" value={driver.vehicleType} />
              <Field label="Plate" value={driver.vehiclePlate ?? '—'} />
              <Field label="Model" value={driver.vehicleModel ?? '—'} />
              <Field label="Colour" value={driver.vehicleColor ?? '—'} />
            </dl>
          </Card>

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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  value={debtPayment}
                  onChange={(event) => setDebtPayment(event.target.value)}
                  placeholder="Amount paid"
                />
                <Button
                  loading={payingDebt}
                  disabled={!debtPayment || Number(debtPayment) <= 0}
                  onClick={() =>
                    void run(
                      () => payDebt({ id, amount: Number(debtPayment) }),
                      () => setDebtPayment(''),
                    )
                  }>
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
                  onClick={() =>
                    void run(
                      () => updateDebtLimit({ id, debtLimit: Number(newLimit) }),
                      () => setNewLimit(''),
                    )
                  }>
                  Set limit
                </Button>
              </div>
            </div>
          </Card>

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
        </div>

        <div className="space-y-4">
          {driver.kycStatus !== 'APPROVED' ? (
            <Card>
              <CardHeader title="Approve KYC" subtitle="Lets this driver go online." />
              <Button
                className="w-full"
                loading={approving}
                onClick={() => void run(() => approveKyc(id))}>
                Approve
              </Button>
            </Card>
          ) : null}

          {driver.kycStatus !== 'REJECTED' ? (
            <Card>
              <CardHeader
                title="Reject KYC"
                subtitle="Sends the driver back to re-shoot their documents. The reason is shown to them."
              />
              <Input
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="What was wrong?"
              />
              <Button
                variant="danger"
                className="mt-3 w-full"
                loading={rejecting}
                disabled={rejectReason.trim().length < 3}
                onClick={() =>
                  void run(
                    () => rejectKyc({ id, reason: rejectReason.trim() }),
                    () => setRejectReason(''),
                  )
                }>
                Reject
              </Button>
            </Card>
          ) : null}

          <Card>
            <CardHeader
              title={driver.isBlocked ? 'Unblock' : 'Block'}
              subtitle={
                driver.isBlocked
                  ? 'Lets them accept work again.'
                  : 'Takes them out of the dispatch pool immediately.'
              }
            />
            <Button
              variant={driver.isBlocked ? 'primary' : 'danger'}
              className="w-full"
              loading={blocking}
              onClick={() => void run(() => blockDriver({ id, isBlocked: !driver.isBlocked }))}>
              {driver.isBlocked ? 'Unblock driver' : 'Block driver'}
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-aiko-dark-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-aiko-dark-900 dark:text-white">{value}</dd>
    </div>
  );
}
