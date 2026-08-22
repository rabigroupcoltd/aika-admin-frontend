import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
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
import { kycTone, money, shortDate } from '@/lib/format';
import { useGetDriversManager, type KycStatus } from '@/modules/drivers/driversController';

export function Drivers() {
  const [kycStatus, setKycStatus] = useState<KycStatus | ''>('');
  const [vehicleType, setVehicleType] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, refetch } = useGetDriversManager({
    kycStatus: kycStatus || undefined,
    vehicleType: vehicleType || undefined,
  });

  /**
   * Name and plate search is client-side.
   *
   * The endpoint returns the whole filtered set in one array with no `q`
   * parameter, and at pilot scale that is a few hundred rows — filtering here
   * is instant and avoids adding a server-side search that nothing else needs
   * yet. Worth moving server-side once the fleet outgrows one response.
   */
  const rows = useMemo(() => {
    const list = data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;

    return list.filter((driver) =>
      [driver.user?.name, driver.user?.phone, driver.vehiclePlate]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [data, search]);

  return (
    <>
      <PageHeader
        title="Drivers"
        subtitle="Everyone registered to carry, whatever their status."
        action={
          <div className="flex flex-wrap gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, phone or plate"
              className="w-56"
            />
            <Select
              value={kycStatus}
              onChange={(event) => setKycStatus(event.target.value as KycStatus | '')}>
              <option value="">All KYC</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </Select>
            <Select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}>
              <option value="">All vehicles</option>
              <option value="BIKE">Bike</option>
              <option value="TRICYCLE">Tricycle</option>
            </Select>
          </div>
        }
      />

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Loading drivers…" />
        ) : isError ? (
          <ErrorState message={error?.message ?? 'Could not load drivers.'} onRetry={refetch} />
        ) : !rows.length ? (
          <EmptyState
            title="No drivers match"
            hint={search ? 'Try a different search.' : 'Adjust the filters above.'}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Driver</Th>
                <Th>Vehicle</Th>
                <Th>KYC</Th>
                <Th>Shift</Th>
                <Th>Debt</Th>
                <Th>Joined</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((driver) => (
                <tr
                  key={driver.id}
                  className="transition-colors hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800/50">
                  <Td>
                    <p className="font-medium">{driver.user?.name ?? 'Unnamed'}</p>
                    <p className="text-xs text-aiko-dark-500">{driver.user?.phone ?? '—'}</p>
                  </Td>
                  <Td>
                    <p>{driver.vehicleType}</p>
                    <p className="text-xs text-aiko-dark-500">{driver.vehiclePlate ?? '—'}</p>
                  </Td>
                  <Td>
                    <Badge tone={kycTone(driver.kycStatus)}>{driver.kycStatus}</Badge>
                  </Td>
                  <Td>
                    {driver.isBlocked ? (
                      <Badge tone="red">Blocked</Badge>
                    ) : driver.isAvailable ? (
                      <Badge tone="green">Online</Badge>
                    ) : (
                      <Badge tone="neutral">Offline</Badge>
                    )}
                  </Td>
                  <Td>
                    <span
                      className={
                        driver.currentDebt >= driver.debtLimit
                          ? 'font-medium text-red-600'
                          : undefined
                      }>
                      {money(driver.currentDebt)}
                    </span>
                    <span className="text-xs text-aiko-dark-500"> / {money(driver.debtLimit)}</span>
                  </Td>
                  <Td className="whitespace-nowrap text-xs text-aiko-dark-500">
                    {shortDate(driver.createdAt)}
                  </Td>
                  <Td>
                    <Link
                      to={`/drivers/${driver.id}`}
                      className="text-sm font-medium text-aiko-green-600 hover:underline">
                      Manage
                    </Link>
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
