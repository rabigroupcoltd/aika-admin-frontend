import { useMemo, useState } from 'react';
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
import { useGetCurrentAdminManager } from '@/modules/auth/authController';
import { BlockUserManager, CreateStaffManager, useGetUsersManager } from '@/modules/users/usersController';
import type { AppUser, StaffRole } from '@/modules/users/type';
import { parseApiError } from '@/utils/parseApiError';

const ROLE_TONE: Record<string, 'green' | 'amber' | 'blue' | 'neutral'> = {
  ADMIN: 'green',
  SUPPORT: 'blue',
  RIDER: 'amber',
  USER: 'neutral',
};

export function Users() {
  const [search, setSearch] = useState('');
  const [showCreateStaff, setShowCreateStaff] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetUsersManager();
  // Block/unblock and staff creation are admin-only on the server — this only
  // decides whether to show the controls at all, so a support account never
  // sees a button that can only ever 403.
  const { data: currentAdmin } = useGetCurrentAdminManager();
  const isAdmin = Boolean(currentAdmin?.roles.includes('ADMIN'));

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
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, email or phone"
              className="w-56"
            />
            {isAdmin ? (
              <Button
                variant={showCreateStaff ? 'outline' : 'primary'}
                onClick={() => setShowCreateStaff((v) => !v)}>
                {showCreateStaff ? 'Cancel' : 'New staff account'}
              </Button>
            ) : null}
          </div>
        }
      />

      {showCreateStaff ? (
        <div className="mb-4">
          <CreateStaffCard onDone={() => setShowCreateStaff(false)} />
        </div>
      ) : null}

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
                <Th>Roles</Th>
                <Th>Status</Th>
                {isAdmin ? <Th /> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <UserRow key={user.id} user={user} isAdmin={isAdmin} />
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}

function UserRow({ user, isAdmin }: { user: AppUser; isAdmin: boolean }) {
  const { blockUser, isLoading } = BlockUserManager();
  const [reason, setReason] = useState('');
  const [asking, setAsking] = useState(false);

  async function toggle() {
    if (!user.isBlocked) {
      setAsking(true);
      return;
    }
    await blockUser({ id: user.id, isBlocked: false });
  }

  async function confirmBlock() {
    await blockUser({ id: user.id, isBlocked: true, reason: reason.trim() || undefined });
    setAsking(false);
    setReason('');
  }

  return (
    <tr className="transition-colors hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800/50">
      <Td className="font-medium">{user.name ?? 'Unnamed'}</Td>
      <Td className="text-aiko-dark-500">{user.email ?? '—'}</Td>
      <Td className="text-aiko-dark-500">{user.phone ?? '—'}</Td>
      <Td>
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <Badge key={role} tone={ROLE_TONE[role] ?? 'neutral'}>
              {role}
            </Badge>
          ))}
        </div>
      </Td>
      <Td>
        {user.isBlocked ? (
          <Badge tone="red">Blocked{user.blockedReason ? ` — ${user.blockedReason}` : ''}</Badge>
        ) : (
          <Badge tone="green">Active</Badge>
        )}
      </Td>
      {isAdmin ? (
        <Td>
          {asking ? (
            <div className="flex items-center gap-1.5">
              <Input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason (optional)"
                className="w-40"
              />
              <Button variant="danger" loading={isLoading} onClick={() => void confirmBlock()}>
                Block
              </Button>
              <Button variant="ghost" onClick={() => setAsking(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant={user.isBlocked ? 'outline' : 'danger'}
              loading={isLoading}
              onClick={() => void toggle()}>
              {user.isBlocked ? 'Unblock' : 'Block'}
            </Button>
          )}
        </Td>
      ) : null}
    </tr>
  );
}

const STAFF_ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: 'SUPPORT', label: 'Support — tickets, orders, drivers, users' },
  { value: 'ADMIN', label: 'Admin — everything' },
];

function CreateStaffCard({ onDone }: { onDone: () => void }) {
  const { createStaff, isLoading } = CreateStaffManager();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('SUPPORT');
  const [formError, setFormError] = useState<string | null>(null);

  const valid = name.trim().length >= 2 && email.trim().length > 3 && password.length >= 8;

  async function submit() {
    setFormError(null);
    try {
      await createStaff({ name: name.trim(), email: email.trim(), password, role });
      setName('');
      setEmail('');
      setPassword('');
      setRole('SUPPORT');
      onDone();
    } catch (e) {
      setFormError(parseApiError(e));
    }
  }

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-aiko-dark-900 dark:text-white">
          New staff account
        </h3>
        <p className="mt-0.5 text-sm text-aiko-dark-500">
          Password-authenticated, same as the seeded admin. Share the password with them
          out of band — there is no invite email yet.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
            Name
          </label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Amina Yusuf" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="support@aiko.ng"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
            Initial password
          </label>
          <Input
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
            Role
          </label>
          <Select value={role} onChange={(event) => setRole(event.target.value as StaffRole)}>
            {STAFF_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {formError ? <p className="mt-3 text-sm text-red-600">{formError}</p> : null}

      <div className="mt-4">
        <Button loading={isLoading} disabled={!valid} onClick={() => void submit()}>
          Create account
        </Button>
      </div>
    </Card>
  );
}
