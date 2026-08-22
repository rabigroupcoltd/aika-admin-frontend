import { useState } from 'react';
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
} from '@/components/ui';
import { shortDate } from '@/lib/format';
import {
  ApproveKycManager,
  RejectKycManager,
  useGetDriversManager,
} from '@/modules/drivers/driversController';
import { parseApiError } from '@/utils/parseApiError';

/**
 * The KYC queue.
 *
 * A dedicated screen rather than a filter on the drivers table, because this is
 * a work queue: the operator is clearing a pile, and every row wants the same
 * two buttons in reach. The drivers table is for looking someone up.
 */
export function KycApprovals() {
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  /** Which card is mid-flight, so only its own button shows a spinner. */
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetDriversManager({
    kycStatus: 'PENDING',
  });

  const { approveKyc } = ApproveKycManager();
  const { rejectKyc } = RejectKycManager();

  async function run(id: string, action: () => Promise<unknown>) {
    setActionError(null);
    setBusyId(id);

    try {
      await action();
      setRejecting(null);
      setReason('');
    } catch (e) {
      setActionError(parseApiError(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="KYC Approvals"
        subtitle="Drivers waiting to be let onto the platform."
      />

      {actionError ? (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {actionError}
        </div>
      ) : null}

      {isLoading ? (
        <Spinner label="Loading queue…" />
      ) : isError ? (
        <ErrorState message={error?.message ?? 'Could not load the queue.'} onRetry={refetch} />
      ) : !data?.length ? (
        <Card>
          <EmptyState
            title="Nothing waiting"
            hint="Every driver who has applied has been reviewed."
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((driver) => (
            <Card key={driver.id}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-aiko-dark-900 dark:text-white">
                    {driver.user?.name ?? 'Unnamed'}
                  </p>
                  <p className="text-sm text-aiko-dark-500">{driver.user?.phone ?? '—'}</p>
                </div>
                <Badge tone="amber">Pending</Badge>
              </div>

              <dl className="mb-4 space-y-1 text-sm">
                <Row label="Vehicle" value={driver.vehicleType} />
                <Row label="Plate" value={driver.vehiclePlate ?? '—'} />
                <Row label="Model" value={driver.vehicleModel ?? '—'} />
                <Row label="Applied" value={shortDate(driver.createdAt)} />
              </dl>

              {rejecting === driver.id ? (
                <div className="space-y-2">
                  <Input
                    autoFocus
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="What was wrong with the documents?"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      className="flex-1"
                      loading={busyId === driver.id}
                      disabled={reason.trim().length < 3}
                      onClick={() =>
                        void run(driver.id, () =>
                          rejectKyc({ id: driver.id, reason: reason.trim() }),
                        )
                      }>
                      Confirm rejection
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setRejecting(null);
                        setReason('');
                      }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    loading={busyId === driver.id}
                    onClick={() => void run(driver.id, () => approveKyc(driver.id))}>
                    Approve
                  </Button>
                  <Button variant="outline" onClick={() => setRejecting(driver.id)}>
                    Reject
                  </Button>
                </div>
              )}

              <Link
                to={`/drivers/${driver.id}`}
                className="mt-3 block text-center text-sm text-aiko-green-600 hover:underline">
                See full profile →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-aiko-dark-500">{label}</dt>
      <dd className="truncate text-aiko-dark-900 dark:text-white">{value}</dd>
    </div>
  );
}
