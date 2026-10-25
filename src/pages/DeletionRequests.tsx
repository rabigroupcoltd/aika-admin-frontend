import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, ErrorState, Input, PageHeader, Select, Spinner } from '@/components/ui';
import { dateTime } from '@/lib/format';
import {
  ProcessDeletionManager,
  RejectDeletionManager,
  useGetDeletionRequestsManager,
  type DeletionRequest,
  type DeletionStatus,
} from '@/modules/account/accountController';
import { parseApiError } from '@/utils/parseApiError';

const PUBLIC_PAGE = 'https://aika-admin.onrender.com/delete-account';

const TONE: Record<DeletionStatus, 'amber' | 'green' | 'neutral'> = {
  PENDING: 'amber',
  COMPLETED: 'green',
  REJECTED: 'neutral',
};

export function DeletionRequests() {
  const [status, setStatus] = useState<DeletionStatus | ''>('PENDING');
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, isLoading, isError, error, refetch } = useGetDeletionRequestsManager({ status });

  return (
    <>
      <PageHeader
        title="Account deletion requests"
        subtitle="Requests made on the public deletion page. In-app deletions happen instantly and are listed here once done."
        action={
          <Select value={status} onChange={(event) => setStatus(event.target.value as DeletionStatus | '')}>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="">All</option>
          </Select>
        }
      />

      <p className="mb-4 text-sm text-aiko-dark-500">
        Public request page:{' '}
        <a href={PUBLIC_PAGE} target="_blank" rel="noreferrer" className="font-medium text-aiko-green-600 hover:underline">
          {PUBLIC_PAGE}
        </a>{' '}
        — use this link in Google Play's Data safety form.
      </p>

      {actionError ? (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {actionError}
        </div>
      ) : null}

      {isLoading ? (
        <Spinner label="Loading requests…" />
      ) : isError ? (
        <ErrorState message={error?.message ?? 'Could not load requests.'} onRetry={refetch} />
      ) : !data?.result.length ? (
        <Card>
          <EmptyState title="No requests" hint={status === 'PENDING' ? 'Nothing waiting.' : undefined} />
        </Card>
      ) : (
        <div className="space-y-3">
          {data.result.map((request) => (
            <RequestCard key={request.id} request={request} onError={setActionError} />
          ))}
        </div>
      )}
    </>
  );
}

function RequestCard({ request, onError }: { request: DeletionRequest; onError: (message: string | null) => void }) {
  const { processRequest, isLoading: processing } = ProcessDeletionManager();
  const { rejectRequest, isLoading: rejecting } = RejectDeletionManager();
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);

  const matched = request.user && !request.user.deletedAt;

  async function run(action: () => Promise<unknown>) {
    onError(null);
    try {
      await action();
    } catch (e) {
      onError(parseApiError(e));
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-aiko-dark-900 dark:text-white">{request.contact}</p>
          <p className="text-xs text-aiko-dark-500">
            Requested {dateTime(request.createdAt)} · via {request.source.toLowerCase()}
            {request.processedAt ? ` · closed ${dateTime(request.processedAt)}` : ''}
          </p>
          {request.reason ? <p className="mt-2 text-sm">“{request.reason}”</p> : null}
          {request.note ? <p className="mt-1 text-xs text-aiko-dark-500">Note: {request.note}</p> : null}
          <p className="mt-2 text-sm">
            {request.user ? (
              request.user.deletedAt ? (
                <span className="text-aiko-dark-500">Account already deleted.</span>
              ) : (
                <>
                  Matches account:{' '}
                  <Link to={`/users/${request.user.id}`} className="font-medium text-aiko-green-600 hover:underline">
                    {request.user.name ?? 'Unnamed'}
                  </Link>{' '}
                  <span className="text-aiko-dark-500">
                    {[request.user.phone, request.user.email].filter(Boolean).join(' · ')}
                  </span>
                </>
              )
            ) : (
              <span className="text-amber-700 dark:text-amber-300">
                No account matches these details. Reject it, or find the user in User Management.
              </span>
            )}
          </p>
        </div>
        <Badge tone={TONE[request.status]}>{request.status.toLowerCase()}</Badge>
      </div>

      {request.status === 'PENDING' ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {matched ? (
            <Button
              variant="danger"
              loading={processing}
              onClick={() => {
                if (window.confirm(`Permanently delete ${request.user?.name ?? 'this account'}? This can't be undone.`)) {
                  void run(() => processRequest({ id: request.id }));
                }
              }}>
              Delete account
            </Button>
          ) : null}
          {showReject ? (
            <>
              <Input
                value={rejectNote}
                onChange={(event) => setRejectNote(event.target.value)}
                placeholder="Reason (optional)"
                className="w-64"
              />
              <Button
                variant="outline"
                loading={rejecting}
                onClick={() => void run(() => rejectRequest({ id: request.id, note: rejectNote.trim() || undefined }))}>
                Confirm reject
              </Button>
              <Button variant="ghost" onClick={() => setShowReject(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setShowReject(true)}>
              Reject
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}
