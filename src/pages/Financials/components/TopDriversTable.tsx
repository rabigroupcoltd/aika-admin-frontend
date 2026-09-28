import { Card, CardHeader, EmptyState, Spinner, Table, Td, Th } from '@/components/ui';
import { money } from '@/lib/format';
import type { TopDriver } from '@/modules/analytics/type';

interface TopDriversTableProps {
  drivers: TopDriver[];
  isLoading: boolean;
}

export function TopDriversTable({ drivers, isLoading }: TopDriversTableProps) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-0">
        <CardHeader title="Top drivers" subtitle="By trips completed" />
      </div>
      {isLoading ? (
        <Spinner />
      ) : !drivers.length ? (
        <EmptyState title="No driver earnings yet" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Driver</Th>
              <Th>Vehicle</Th>
              <Th>Trips</Th>
              <Th>Earned</Th>
              <Th>Rating</Th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <Td className="font-medium">{driver.name ?? 'Unnamed'}</Td>
                <Td>{driver.vehicleType}</Td>
                <Td>{driver.totalTrips}</Td>
                <Td className="font-medium">{money(driver.totalEarnings)}</Td>
                <Td>{driver.rating != null ? driver.rating.toFixed(1) : '—'}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
