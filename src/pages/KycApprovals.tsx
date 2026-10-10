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
  useGetIncompleteApplicationsManager,
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

              {driver.vehiclePhotos?.length ? (
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {driver.vehiclePhotos.slice(0, 8).map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.url}
                      target="_blank"
                      rel="noreferrer"
                      title={photo.type.replace(/_/g, ' ').toLowerCase()}
                      className="block aspect-square overflow-hidden rounded-md bg-aiko-dark-100 dark:bg-aiko-dark-800">
                      <img src={photo.url} alt={photo.type} className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mb-3 text-xs text-aiko-dark-500">No documents uploaded.</p>
              )}

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

      <IncompleteApplications />
    </>
  );
}

/**
 * Riders who picked "drive" but never submitted their vehicle. There is no
 * driver profile to approve yet — the operator's move is to contact them so
 * they finish the documents step in the app, after which they land above.
 */
function IncompleteApplications() {
  const { data, isLoading, isError, error, refetch } = useGetIncompleteApplicationsManager();

  if (isLoading) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-1 text-base font-semibold text-aiko-dark-900 dark:text-white">
        Started, not submitted
      </h2>
      <p className="mb-4 text-sm text-aiko-dark-500">
        These riders chose to drive but haven't sent their vehicle documents yet, so there's
        nothing to approve. Ask them to open the app and finish the documents step — they'll
        appear in the queue above once they do.
      </p>

      {isError ? (
        <ErrorState message={error?.message ?? 'Could not load applications.'} onRetry={refetch} />
      ) : !data?.length ? (
        <Card>
          <EmptyState title="None" hint="Everyone who chose to drive has submitted." />
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-aiko-dark-100 dark:divide-aiko-dark-800">
            {data.map((applicant) => (
              <li key={applicant.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-aiko-dark-900 dark:text-white">
                    {applicant.name ?? 'Unnamed'}
                  </p>
                  <p className="text-sm text-aiko-dark-500">
                    {[applicant.phone, applicant.email].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-aiko-dark-500">Last active {shortDate(applicant.updatedAt)}</span>
                  {applicant.phone ? (
                    <a
                      href={`tel:${applicant.phone}`}
                      className="font-medium text-aiko-green-600 hover:underline">
                      Call
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
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
