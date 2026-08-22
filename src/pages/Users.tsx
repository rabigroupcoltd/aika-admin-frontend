import { useMemo, useState } from 'react';
import {
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Spinner,
  Table,
  Td,
  Th,
} from '@/components/ui';
import { useGetUsersManager } from '@/modules/users/usersController';

export function Users() {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, refetch } = useGetUsersManager();

  // Same reasoning as the drivers table: the endpoint returns one array with no
  // search parameter, and at pilot scale filtering here is instant.
  const rows = useMemo(() => {
    const list = data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;

    return list.filter((user) =>
      [user.name, user.email, user.phone]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [data, search]);

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Everyone with an Aiko account."
        action={
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email or phone"
            className="w-64"
          />
        }
      />

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Loading users…" />
        ) : isError ? (
          <ErrorState message={error?.message ?? 'Could not load users.'} onRetry={refetch} />
        ) : !rows.length ? (
          <EmptyState title="No users match" hint="Try a different search." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800/50">
                  <Td className="font-medium">{user.name ?? 'Unnamed'}</Td>
                  <Td className="text-aiko-dark-500">{user.email ?? '—'}</Td>
                  <Td className="text-aiko-dark-500">{user.phone ?? '—'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
