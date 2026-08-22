import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Spinner,
  Table,
  Td,
  Th,
  cn,
} from '@/components/ui';
import { priorityTone, relative, supportTone } from '@/lib/format';
import { useGetTicketsManager, type SupportStatus } from '@/modules/support/supportController';

const TABS: { value: SupportStatus | ''; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'PENDING', label: 'Awaiting customer' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: '', label: 'All' },
];

export function Support() {
  // Opens on OPEN rather than All: this is a work queue, and the queue is what
  // has not been dealt with.
  const [status, setStatus] = useState<SupportStatus | ''>('OPEN');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, refetch } = useGetTicketsManager({
    status: status || undefined,
    q: search.trim() || undefined,
    limit: 50,
  });

  return (
    <>
      <PageHeader
        title="Support"
        subtitle="Tickets raised by customers and drivers."
        action={
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Reference or subject"
            className="w-64"
          />
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              status === tab.value
                ? 'bg-aiko-green-500 text-white'
                : 'bg-white text-aiko-dark-600 hover:bg-aiko-dark-100 dark:bg-aiko-dark-900 dark:text-aiko-dark-300 dark:hover:bg-aiko-dark-800',
            )}>
            {tab.label}
            {tab.value && data?.counts?.[tab.value] ? (
              <span
                className={cn(
                  'ml-2 rounded-full px-1.5 py-0.5 text-xs',
                  status === tab.value
                    ? 'bg-white/20'
                    : 'bg-aiko-dark-100 dark:bg-aiko-dark-800',
                )}>
                {data.counts[tab.value]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Loading tickets…" />
        ) : isError ? (
          <ErrorState message={error?.message ?? 'Could not load tickets.'} onRetry={refetch} />
        ) : !data?.data.length ? (
          <EmptyState
            title="Nothing here"
            hint={status === 'OPEN' ? 'No open tickets — the queue is clear.' : undefined}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Subject</Th>
                <Th>From</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Assigned</Th>
                <Th>Activity</Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="transition-colors hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800/50">
                  <Td>
                    <Link
                      to={`/support/${ticket.id}`}
                      className="font-medium text-aiko-green-600 hover:underline">
                      {ticket.reference}
                    </Link>
                  </Td>
                  <Td className="max-w-[280px]">
                    <span className="line-clamp-1">{ticket.subject}</span>
                    {ticket._count?.messages ? (
                      <span className="text-xs text-aiko-dark-500">
                        {ticket._count.messages} message
                        {ticket._count.messages === 1 ? '' : 's'}
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    <p className="text-sm">{ticket.requester?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-aiko-dark-500">{ticket.requester?.phone ?? '—'}</p>
                  </Td>
                  <Td>
                    <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={supportTone(ticket.status)}>{ticket.status}</Badge>
                  </Td>
                  <Td className="text-sm text-aiko-dark-500">
                    {ticket.assignee?.name ?? <span className="text-amber-600">Unassigned</span>}
                  </Td>
                  <Td className="whitespace-nowrap text-xs text-aiko-dark-500">
                    {relative(ticket.lastMessageAt)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
