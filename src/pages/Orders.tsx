import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Select,
  Spinner,
  Table,
  Td,
  Th,
} from '@/components/ui';
import { dateTime, humanise, money, orderTone } from '@/lib/format';
import { useGetOrdersManager } from '@/modules/orders/ordersController';
import type { OrderStatus } from '@/modules/orders/type';

/**
 * Statuses worth filtering by, in the order an operator thinks about them.
 *
 * Both lanes share the enum, but the marketplace lane is the one the pilot
 * runs, so its states lead. The legacy bid-lane states are still listed —
 * historical orders carry them and hiding them would make those rows
 * unreachable.
 */
const STATUS_FILTERS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'SEARCHING_FOR_DRIVER', label: 'Searching for driver' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'DRIVER_ARRIVING_PICKUP', label: 'Arriving at pickup' },
  { value: 'PICKED_UP', label: 'Picked up' },
  { value: 'IN_TRANSIT', label: 'In transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_DRIVER_FOUND', label: 'No driver found' },
];

export function Orders() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useGetOrdersManager({
    status: status || undefined,
    page,
    limit: 25,
  });

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Every delivery, current and historical."
        action={
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as OrderStatus | '');
              // A filter change invalidates the page number — page 4 of the old
              // filter is rarely page 4 of the new one.
              setPage(1);
            }}>
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        }
      />

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Loading orders…" />
        ) : isError ? (
          <ErrorState message={error?.message ?? 'Could not load orders.'} onRetry={refetch} />
        ) : !data?.result.length ? (
          <EmptyState
            title="No orders here"
            hint={status ? 'Try a different status.' : 'Orders will appear as they are placed.'}
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Route</Th>
                  <Th>Sending</Th>
                  <Th>Vehicle</Th>
                  <Th>Fare</Th>
                  <Th>Status</Th>
                  <Th>Placed</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {data.result.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800/50">
                    <Td>
                      <p className="font-medium">{order.pickupLocation}</p>
                      <p className="text-xs text-aiko-dark-500">→ {order.dropoffLocation}</p>
                    </Td>
                    <Td className="max-w-[200px]">
                      <span className="line-clamp-2 text-xs text-aiko-dark-600 dark:text-aiko-dark-300">
                        {order.description || <span className="text-aiko-dark-400">—</span>}
                      </span>
                    </Td>
                    <Td>{order.vehicleType}</Td>
                    <Td className="font-medium">{money(order.fare, order.currency)}</Td>
                    <Td>
                      <Badge tone={orderTone(order.status)}>{humanise(order.status)}</Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-aiko-dark-500">
                      {dateTime(order.createdAt)}
                    </Td>
                    <Td>
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-sm font-medium text-aiko-green-600 hover:underline">
                        View
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="flex items-center justify-between border-t border-aiko-dark-100 px-4 py-3 dark:border-aiko-dark-800">
              <p className="text-sm text-aiko-dark-500">
                Page {data.currentPage} of {data.totalPages} · {data.totalItems} orders
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
                  disabled={page >= data.totalPages}
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
