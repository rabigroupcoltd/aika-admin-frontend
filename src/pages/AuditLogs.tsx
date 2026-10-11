import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Spinner,
  Table,
  Td,
  Th,
} from '@/components/ui';
import { dateTime } from '@/lib/format';
import {
  AUDIT_ENTITIES,
  useGetAuditActionsManager,
  useGetAuditLogsManager,
} from '@/modules/audit/auditController';
import type { AuditEntity } from '@/modules/audit/type';

export function AuditLogs() {
  const [entity, setEntity] = useState<AuditEntity | ''>('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetAuditLogsManager({
    entity: entity || undefined,
    action: action || undefined,
    page,
    limit: 25,
  });

  const { data: actions } = useGetAuditActionsManager();

  return (
    <>
      <PageHeader
        title="Audit Logs"
        subtitle="Every state-changing action an administrator has taken."
        action={
          <div className="flex flex-wrap gap-2">
            <Select
              value={entity}
              onChange={(event) => {
                setEntity(event.target.value as AuditEntity | '');
                setPage(1);
              }}>
              <option value="">All entities</option>
              {AUDIT_ENTITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
            {actions?.length ? (
              <Select
                value={action}
                onChange={(event) => {
                  setAction(event.target.value);
                  setPage(1);
                }}>
                <option value="">All actions</option>
                {actions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                value={action}
                onChange={(event) => setAction(event.target.value)}
                placeholder="Filter by action"
                className="w-48"
              />
            )}
          </div>
        }
      />

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Loading audit trail…" />
        ) : isError ? (
          <ErrorState message={error?.message ?? 'Could not load the trail.'} onRetry={refetch} />
        ) : !data?.data.length ? (
          <EmptyState
            title="Nothing recorded"
            hint="Actions appear here as administrators take them."
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>When</Th>
                  <Th>Who</Th>
                  <Th>Action</Th>
                  <Th>What happened</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((entry) => (
                  <tr key={entry.id} className="align-top">
                    <Td className="whitespace-nowrap text-xs text-aiko-dark-500">
                      {dateTime(entry.createdAt)}
                    </Td>
                    <Td>
                      <p className="text-sm font-medium">{entry.actorName ?? 'System'}</p>
                      {entry.actorRole ? (
                        <p className="text-xs text-aiko-dark-500">{entry.actorRole}</p>
                      ) : null}
                    </Td>
                    <Td>
                      <code className="rounded bg-aiko-dark-100 px-1.5 py-0.5 text-xs dark:bg-aiko-dark-800">
                        {entry.action}
                      </code>
                      <div className="mt-1">
                        <Badge tone="neutral">{entry.entity}</Badge>
                      </div>
                    </Td>
                    <Td>
                      <p className="text-sm">{entry.summary}</p>
                      {expanded === entry.id && entry.metadata ? (
                        <pre className="mt-2 max-w-md overflow-x-auto rounded bg-aiko-dark-50 p-2 text-xs dark:bg-aiko-dark-800">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      ) : null}
                    </Td>
                    <Td>
                      {entry.metadata ? (
                        <button
                          onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                          className="text-sm text-aiko-green-600 hover:underline">
                          {expanded === entry.id ? 'Hide' : 'Details'}
                        </button>
                      ) : null}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="flex items-center justify-between border-t border-aiko-dark-100 px-4 py-3 dark:border-aiko-dark-800">
              <p className="text-sm text-aiko-dark-500">
                Page {data.meta.page} of {data.meta.pages} · {data.meta.total} entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= data.meta.pages}
                  onClick={() => setPage((current) => current + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
