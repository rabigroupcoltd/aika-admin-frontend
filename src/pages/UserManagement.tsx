import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MoreVertical, Plus, Search } from 'lucide-react';
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
  cn,
} from '@/components/ui';
import { money, relative, shortDate } from '@/lib/format';
import { useGetCurrentAdminManager } from '@/modules/auth/authController';
import { ApproveKycManager } from '@/modules/drivers/driversController';
import {
  BlockUserManager,
  useGetUserDirectoryManager,
} from '@/modules/users/usersController';
import type { DirectoryType, DirectoryUser, DriverApproval } from '@/modules/users/type';
import { CreateStaffCard } from '@/components/CreateStaffCard';
import { parseApiError } from '@/utils/parseApiError';

const TABS: { key: DirectoryType; label: string; param: string }[] = [
  { key: 'PASSENGER', label: 'Passengers', param: 'passengers' },
  { key: 'DRIVER', label: 'Drivers', param: 'drivers' },
  { key: 'STAFF', label: 'Staff', param: 'staff' },
];

const APPROVAL_LABEL: Record<DriverApproval, string> = {
  NOT_SUBMITTED: 'Not submitted',
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const APPROVAL_TONE: Record<DriverApproval, 'green' | 'amber' | 'red' | 'neutral'> = {
  NOT_SUBMITTED: 'neutral',
  PENDING: 'amber',
  APPROVED: 'green',
  REJECTED: 'red',
};

/**
 * User management: passengers, drivers and staff on one screen, one tab each.
 *
 * Every row opens the user's full profile, where an admin reviews documents,
 * approves, sees trips and money. The Drivers tab is built from users rather
 * than driver rows, so someone who chose to drive but never submitted
 * documents is listed — marked "Not submitted" — instead of being invisible.
 */
export function UserManagement() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t.param === params.get('tab')) ?? TABS[0];

  const [search, setSearch] = useState('');
  const [approval, setApproval] = useState<DriverApproval | ''>(
    (params.get('approval') as DriverApproval | null) ?? '',
  );
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: currentAdmin } = useGetCurrentAdminManager();
  const isAdmin = Boolean(currentAdmin?.roles.includes('ADMIN'));

  const { data, isLoading, isError, error, refetch, isFetching } = useGetUserDirectoryManager({
    type: tab.key,
    search,
    approval: tab.key === 'DRIVER' ? approval : '',
  });

  const { approveKyc } = ApproveKycManager();
  const { blockUser } = BlockUserManager();

  function selectTab(param: string) {
    setParams({ tab: param });
    setApproval('');
    setSearch('');
  }

  async function run(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
      await refetch();
    } catch (e) {
      setActionError(parseApiError(e));
    }
  }

  const counts = data?.counts;
  const countFor: Record<DirectoryType, number | undefined> = {
    PASSENGER: counts?.passengers,
    DRIVER: counts?.drivers,
    STAFF: counts?.staff,
  };

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Review, approve and manage everyone on Aiko."
        action={
          tab.key === 'STAFF' && isAdmin ? (
            <Button
              variant={showCreateStaff ? 'outline' : 'primary'}
              onClick={() => setShowCreateStaff((v) => !v)}>
              {showCreateStaff ? (
                'Cancel'
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> New staff account
                </span>
              )}
            </Button>
          ) : null
        }
      />

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-0.5 rounded-lg bg-aiko-dark-100 p-1 dark:bg-aiko-dark-800">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => selectTab(t.param)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                tab.key === t.key
                  ? 'bg-white text-aiko-dark-900 shadow-sm dark:bg-aiko-dark-700 dark:text-white'
                  : 'text-aiko-dark-500 hover:text-aiko-dark-800 dark:text-aiko-dark-400 dark:hover:text-white',
              )}>
              {t.label}
              {countFor[t.key] !== undefined ? (
                <span className="ml-1.5 text-xs text-aiko-dark-400">{countFor[t.key]}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-wrap justify-end gap-2">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aiko-dark-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${tab.label.toLowerCase()}…`}
              className="pl-9"
            />
          </div>
          {tab.key === 'DRIVER' ? (
            <Select
              value={approval}
              onChange={(event) => setApproval(event.target.value as DriverApproval | '')}>
              <option value="">All approval states</option>
              {(Object.keys(APPROVAL_LABEL) as DriverApproval[]).map((key) => (
                <option key={key} value={key}>
                  {APPROVAL_LABEL[key]}
                </option>
              ))}
            </Select>
          ) : null}
        </div>
      </div>

      {/* Work waiting on the Drivers tab, one click to filter to it. */}
      {tab.key === 'DRIVER' && counts && (counts.pendingDrivers > 0 || counts.notSubmitted > 0) ? (
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {counts.pendingDrivers > 0 ? (
            <button
              onClick={() => setApproval('PENDING')}
              className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">
              {counts.pendingDrivers} waiting for approval →
            </button>
          ) : null}
          {counts.notSubmitted > 0 ? (
            <button
              onClick={() => setApproval('NOT_SUBMITTED')}
              className="rounded-full bg-aiko-dark-100 px-3 py-1 font-medium text-aiko-dark-600 hover:bg-aiko-dark-200 dark:bg-aiko-dark-800 dark:text-aiko-dark-300">
              {counts.notSubmitted} started but not submitted
            </button>
          ) : null}
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {actionError}
        </div>
      ) : null}

      {showCreateStaff && tab.key === 'STAFF' ? (
        <div className="mb-4">
          <CreateStaffCard
            onDone={() => {
              setShowCreateStaff(false);
              void refetch();
            }}
          />
        </div>
      ) : null}

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Loading users…" />
        ) : isError ? (
          <ErrorState message={error?.message ?? 'Could not load users.'} onRetry={refetch} />
        ) : !data?.result.length ? (
          <EmptyState
            title={`No ${tab.label.toLowerCase()} found`}
            hint={search || approval ? 'Try clearing the search or filter.' : undefined}
          />
        ) : (
          <div className={cn('overflow-x-auto transition-opacity', isFetching && 'opacity-60')}>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th className="hidden md:table-cell">Contact</Th>
                  {tab.key === 'DRIVER' ? (
                    <>
                      <Th className="hidden lg:table-cell">Vehicle</Th>
                      <Th>Approval</Th>
                      <Th className="hidden lg:table-cell">Commission owed</Th>
                    </>
                  ) : tab.key === 'PASSENGER' ? (
                    <Th className="hidden lg:table-cell">Trips</Th>
                  ) : (
                    <Th>Role</Th>
                  )}
                  <Th>Status</Th>
                  <Th className="hidden xl:table-cell">Joined</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {data.result.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    type={tab.key}
                    isAdmin={isAdmin}
                    onOpen={() => navigate(`/users/${user.id}`)}
                    onApprove={
                      user.driver && user.driverStatus === 'PENDING'
                        ? () => run(() => approveKyc(user.driver!.id))
                        : undefined
                    }
                    onToggleBlock={() =>
                      run(() => blockUser({ id: user.id, isBlocked: !user.isBlocked }))
                    }
                  />
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </>
  );
}

function UserRow({
  user,
  type,
  isAdmin,
  onOpen,
  onApprove,
  onToggleBlock,
}: {
  user: DirectoryUser;
  type: DirectoryType;
  isAdmin: boolean;
  onOpen: () => void;
  onApprove?: () => void;
  onToggleBlock: () => void;
}) {
  const photo = user.profilePhotoUrl ?? user.photoUrl;
  const initials = (user.name ?? user.email ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <tr
      onClick={onOpen}
      className="cursor-pointer transition-colors hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800/50">
      <Td>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-aiko-green-100 text-xs font-semibold text-aiko-green-700 dark:bg-aiko-green-900/40 dark:text-aiko-green-300">
            {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-aiko-dark-900 dark:text-white">
              {user.name ?? 'Unnamed'}
            </p>
            <p className="truncate text-xs text-aiko-dark-500 md:hidden">
              {user.phone ?? user.email ?? '—'}
            </p>
          </div>
        </div>
      </Td>
      <Td className="hidden md:table-cell">
        <p className="text-sm">{user.phone ?? '—'}</p>
        <p className="text-xs text-aiko-dark-500">{user.email ?? ''}</p>
      </Td>

      {type === 'DRIVER' ? (
        <>
          <Td className="hidden lg:table-cell">
            {user.driver ? (
              <>
                <p className="text-sm">{[user.driver.vehicleBrand, user.driver.vehicleModel].filter(Boolean).join(' ') || user.driver.vehicleType}</p>
                <p className="text-xs text-aiko-dark-500">{user.driver.vehiclePlate ?? '—'}</p>
              </>
            ) : (
              <span className="text-aiko-dark-400">—</span>
            )}
          </Td>
          <Td>
            {user.driverStatus ? (
              <Badge tone={APPROVAL_TONE[user.driverStatus]}>
                {APPROVAL_LABEL[user.driverStatus]}
              </Badge>
            ) : null}
          </Td>
          <Td className="hidden lg:table-cell">
            {user.driver ? (
              <span className={user.driver.debt.locked ? 'font-medium text-red-600' : undefined}>
                {money(user.driver.currentDebt)}
              </span>
            ) : (
              <span className="text-aiko-dark-400">—</span>
            )}
          </Td>
        </>
      ) : type === 'PASSENGER' ? (
        <Td className="hidden lg:table-cell">{user.passengerTrips}</Td>
      ) : (
        <Td>
          <Badge tone={user.roles.includes('ADMIN') ? 'blue' : 'neutral'}>
            {user.roles.includes('ADMIN') ? 'Admin' : 'Support'}
          </Badge>
        </Td>
      )}

      <Td>
        {user.isBlocked ? (
          <Badge tone="red">Blocked</Badge>
        ) : user.driver?.debt.locked ? (
          <Badge tone="amber">Debt limit</Badge>
        ) : user.driver?.isAvailable ? (
          <Badge tone="green">Online</Badge>
        ) : (
          <Badge tone="neutral">Active</Badge>
        )}
      </Td>
      <Td className="hidden whitespace-nowrap text-xs text-aiko-dark-500 xl:table-cell">
        <p>{shortDate(user.createdAt)}</p>
        {user.lastLoginAt ? <p>seen {relative(user.lastLoginAt)}</p> : null}
      </Td>
      <Td className="text-right">
        <RowMenu
          isAdmin={isAdmin}
          isBlocked={user.isBlocked}
          onOpen={onOpen}
          onApprove={onApprove}
          onToggleBlock={onToggleBlock}
        />
      </Td>
    </tr>
  );
}

/** The ⋮ menu. Clicks inside never bubble to the row's open-profile handler. */
function RowMenu({
  isAdmin,
  isBlocked,
  onOpen,
  onApprove,
  onToggleBlock,
}: {
  isAdmin: boolean;
  isBlocked: boolean;
  onOpen: () => void;
  onApprove?: () => void;
  onToggleBlock: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const item =
    'block w-full px-4 py-2 text-left text-sm hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800';

  return (
    <div ref={ref} className="relative inline-block" onClick={(event) => event.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Actions"
        className="rounded-md p-1.5 text-aiko-dark-500 hover:bg-aiko-dark-100 dark:hover:bg-aiko-dark-800">
        <MoreVertical className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-aiko-dark-100 bg-white py-1 shadow-lg dark:border-aiko-dark-800 dark:bg-aiko-dark-900">
          <button className={item} onClick={() => { setOpen(false); onOpen(); }}>
            View profile
          </button>
          {isAdmin && onApprove ? (
            <button
              className={cn(item, 'font-medium text-aiko-green-600')}
              onClick={() => { setOpen(false); onApprove(); }}>
              Approve driver
            </button>
          ) : null}
          {isAdmin ? (
            <button
              className={cn(item, isBlocked ? 'text-aiko-green-600' : 'text-red-600')}
              onClick={() => {
                setOpen(false);
                if (isBlocked || window.confirm('Block this account? They will be signed out at once.')) {
                  onToggleBlock();
                }
              }}>
              {isBlocked ? 'Unblock account' : 'Block account'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
