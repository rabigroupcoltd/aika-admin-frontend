import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, EmptyState, ErrorState, Spinner, Table, Td, Th, cn } from '@/components/ui';
import { dateTime, humanise, money, orderTone } from '@/lib/format';
import { useGetOrdersManager } from '@/modules/orders/ordersController';

const PAGE_SIZE = 10;

/**
 * Trip history. A driver has two: trips they drove, and trips they booked as
 * a passenger — every driver is a passenger too — so they get a switch.
 */
export function TripsTab({ userId, driverId }: { userId: string; driverId: string | null }) {
  const navigate = useNavigate();
  const [side, setSide] = useState<'driver' | 'passenger'>(driverId ? 'driver' : 'passenger');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useGetOrdersManager({
    ...(side === 'driver' && driverId ? { driverId } : { userId }),
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="space-y-3">
      {driverId ? (
        <div className="inline-flex gap-0.5 rounded-lg bg-aiko-dark-100 p-1 dark:bg-aiko-dark-800">
          {(['driver', 'passenger'] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                setSide(key);
                setPage(1);
              }}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium',
                side === key
                  ? 'bg-white shadow-sm dark:bg-aiko-dark-700 dark:text-white'
                  : 'text-aiko-dark-500',
              )}>
              {key === 'driver' ? 'As driver' : 'As passenger'}
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <Spinner label="Loading trips…" />
      ) : isError ? (
        <ErrorState message={error?.message ?? 'Could not load trips.'} onRetry={refetch} />
      ) : !data?.result.length ? (
        <EmptyState title="No trips yet" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Route</Th>
                  <Th>Fare</Th>
                  {side === 'driver' ? <Th className="hidden md:table-cell">Commission</Th> : null}
                  <Th>Payment</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {data.result.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="cursor-pointer hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800/50">
                    <Td className="whitespace-nowrap text-xs text-aiko-dark-500">{dateTime(order.createdAt)}</Td>
                    <Td>
                      <p className="max-w-[16rem] truncate text-sm">{order.pickupLocation}</p>
                      <p className="max-w-[16rem] truncate text-xs text-aiko-dark-500">→ {order.dropoffLocation}</p>
                    </Td>
                    <Td className="font-medium">{money(order.fare)}</Td>
                    {side === 'driver' ? (
                      <Td className="hidden text-aiko-dark-500 md:table-cell">{money(order.platformFee)}</Td>
                    ) : null}
                    <Td className="text-xs">{humanise(order.paymentMethod)}</Td>
                    <Td>
                      <Badge tone={orderTone(order.status)}>{humanise(order.status)}</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {data.totalPages > 1 ? (
            <div className="flex items-center justify-between text-sm text-aiko-dark-500">
              <span>
                Page {data.currentPage} of {data.totalPages} · {data.totalItems} trips
              </span>
              <div className="flex gap-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
