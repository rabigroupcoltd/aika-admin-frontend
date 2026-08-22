import { ArrowLeft, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorState,
  PageHeader,
  Select,
  Spinner,
  cn,
} from '@/components/ui';
import { dateTime, humanise, money, priorityTone, supportTone } from '@/lib/format';
import {
  ReplyToTicketManager,
  SUPPORT_PRIORITIES,
  SUPPORT_STATUSES,
  UpdateTicketManager,
  useGetTicketByIdManager,
  type SupportPriority,
  type SupportStatus,
} from '@/modules/support/supportController';
import { parseApiError } from '@/utils/parseApiError';

export function SupportDetail() {
  const { id = '' } = useParams();
  const [body, setBody] = useState('');
  const [internal, setInternal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: ticket, isLoading, isError, error, refetch } = useGetTicketByIdManager({
    ticketId: id,
  });

  const { replyToTicket, isLoading: sending } = ReplyToTicketManager();
  const { updateTicket } = UpdateTicketManager();

  async function handleReply() {
    setActionError(null);

    try {
      await replyToTicket({ id, body: body.trim(), internal });
      setBody('');
      setInternal(false);
    } catch (e) {
      setActionError(parseApiError(e));
    }
  }

  async function handleUpdate(patch: { status?: SupportStatus; priority?: SupportPriority }) {
    setActionError(null);

    try {
      await updateTicket({ id, ...patch });
    } catch (e) {
      setActionError(parseApiError(e));
    }
  }

  if (isLoading) return <Spinner label="Loading ticket…" />;
  if (isError || !ticket) {
    return (
      <ErrorState message={error?.message ?? 'Could not load this ticket.'} onRetry={refetch} />
    );
  }

  return (
    <>
      <Link
        to="/support"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-aiko-dark-500 hover:text-aiko-green-600">
        <ArrowLeft className="h-4 w-4" />
        Back to support
      </Link>

      <PageHeader
        title={ticket.subject}
        subtitle={`${ticket.reference} · raised ${dateTime(ticket.createdAt)}`}
        action={
          <div className="flex gap-2">
            <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>
            <Badge tone={supportTone(ticket.status)}>{ticket.status}</Badge>
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
            <CardHeader title="Conversation" />
            <div className="space-y-3">
              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'rounded-lg p-3',
                    message.internal
                      ? 'border border-dashed border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                      : message.fromStaff
                        ? 'bg-aiko-green-50 dark:bg-aiko-green-900/20'
                        : 'bg-aiko-dark-50 dark:bg-aiko-dark-800',
                  )}>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-aiko-dark-900 dark:text-white">
                      {message.sender?.name ?? (message.fromStaff ? 'Support' : 'Customer')}
                    </span>
                    {message.internal ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                        <Lock className="h-3 w-3" />
                        Internal note
                      </span>
                    ) : null}
                    <span className="ml-auto text-xs text-aiko-dark-500">
                      {dateTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-aiko-dark-800 dark:text-aiko-dark-200">
                    {message.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-aiko-dark-100 pt-4 dark:border-aiko-dark-800">
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
                placeholder={internal ? 'A note only staff will see…' : 'Reply to the customer…'}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm',
                  'focus:outline-none focus:ring-1 focus:ring-aiko-green-500',
                  internal
                    ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                    : 'border-aiko-dark-300 bg-white dark:border-aiko-dark-600 dark:bg-aiko-dark-800 dark:text-white',
                )}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-aiko-dark-600 dark:text-aiko-dark-300">
                  <input
                    type="checkbox"
                    checked={internal}
                    onChange={(event) => setInternal(event.target.checked)}
                    className="h-4 w-4 rounded border-aiko-dark-300 accent-amber-500"
                  />
                  Internal note — the customer never sees this
                </label>
                <Button
                  loading={sending}
                  disabled={!body.trim()}
                  onClick={() => void handleReply()}>
                  {internal ? 'Add note' : 'Send reply'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Manage" />
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
                  Status
                </label>
                <Select
                  className="w-full"
                  value={ticket.status}
                  onChange={(event) =>
                    void handleUpdate({ status: event.target.value as SupportStatus })
                  }>
                  {SUPPORT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {humanise(status)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
                  Priority
                </label>
                <Select
                  className="w-full"
                  value={ticket.priority}
                  onChange={(event) =>
                    void handleUpdate({ priority: event.target.value as SupportPriority })
                  }>
                  {SUPPORT_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {humanise(priority)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Raised by" />
            <p className="text-sm font-medium text-aiko-dark-900 dark:text-white">
              {ticket.requester?.name ?? 'Unknown'}
            </p>
            <p className="text-sm text-aiko-dark-500">{ticket.requester?.phone ?? '—'}</p>
          </Card>

          {ticket.order ? (
            <Card>
              <CardHeader title="Related order" />
              <p className="text-sm text-aiko-dark-800 dark:text-aiko-dark-200">
                {ticket.order.pickupLocation}
              </p>
              <p className="text-sm text-aiko-dark-500">→ {ticket.order.dropoffLocation}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone="neutral">{humanise(ticket.order.status)}</Badge>
                <span className="text-sm font-medium">
                  {money(ticket.order.fare, ticket.order.currency)}
                </span>
              </div>
              <Link
                to={`/orders/${ticket.order.id}`}
                className="mt-3 inline-block text-sm font-medium text-aiko-green-600 hover:underline">
                Open order →
              </Link>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
