import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge, ErrorState, PageHeader, Spinner } from '@/components/ui';
import { dateTime, priorityTone, supportTone } from '@/lib/format';
import { ReplyToTicketManager, UpdateTicketManager, useGetTicketByIdManager } from '@/modules/support/supportController';
import type { SupportPriority, SupportStatus } from '@/modules/support/type';
import { parseApiError } from '@/utils/parseApiError';
import { RelatedOrderCard } from './components/RelatedOrderCard';
import { RequesterCard } from './components/RequesterCard';
import { TicketConversation } from './components/TicketConversation';
import { TicketManageCard } from './components/TicketManageCard';

export function SupportDetail() {
  const { id = '' } = useParams();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: ticket, isLoading, isError, error, refetch } = useGetTicketByIdManager({
    ticketId: id,
  });

  const { replyToTicket, isLoading: sending } = ReplyToTicketManager();
  const { updateTicket } = UpdateTicketManager();

  async function handleSend(body: string, internal: boolean) {
    setActionError(null);

    try {
      await replyToTicket({ id, body, internal });
    } catch (e) {
      setActionError(parseApiError(e));
      throw e;
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
          <TicketConversation messages={ticket.messages} sending={sending} onSend={handleSend} />
        </div>

        <div className="space-y-4">
          <TicketManageCard
            status={ticket.status}
            priority={ticket.priority}
            onUpdate={handleUpdate}
          />

          <RequesterCard requester={ticket.requester} />

          {ticket.order ? <RelatedOrderCard order={ticket.order} /> : null}
        </div>
      </div>
    </>
  );
}
