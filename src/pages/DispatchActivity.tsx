import { Link } from 'react-router-dom';
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
  Table,
  Td,
  Th,
} from '@/components/ui';
import { duration, money } from '@/lib/format';
import { useGetSocketActivityManager } from '@/modules/admin/adminController';

/**
 * What dispatch is doing right now.
 *
 * The one number worth staring at is `offeredTo`: an order sitting unclaimed is
 * either reaching nobody — no drivers online in range, so widen or recruit — or
 * reaching everybody and being refused, which is a pricing or a parcel problem.
 * The two look identical on the orders table and need opposite responses.
 */
export function DispatchActivity() {
  // A live view — an operator leaves it open while working, so the controller's
  // ten-second default is exactly right here.
  const { data, isLoading, isError, error, refetch } = useGetSocketActivityManager();

  if (isLoading) return <Spinner label="Reading dispatch state…" />;
  if (isError || !data) {
    return (
      <ErrorState message={error?.message ?? 'Could not read dispatch state.'} onRetry={refetch} />
    );
  }

  return (
    <>
      <PageHeader
        title="Dispatch Activity"
        subtitle="The live driver pool and every order still on the market. Refreshes every 10 seconds."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open orders" value={data.dispatch.openOrders} warn={data.dispatch.openOrders > 0} />
        <Stat label="Active trips" value={data.dispatch.activeTrips} />
        <Stat label="Drivers in pool" value={data.dispatch.driversInPool} />
        <Card>
          <p className="text-sm text-aiko-dark-500">Pool by vehicle</p>
          <div className="mt-2 space-y-1">
            {Object.entries(data.dispatch.poolByVehicle).map(([vehicle, count]) => (
              <div key={vehicle} className="flex justify-between text-sm">
                <span className="text-aiko-dark-600 dark:text-aiko-dark-300">{vehicle}</span>
                <span className="font-medium text-aiko-dark-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="On the market"
            subtitle="Orders nobody has claimed yet, oldest first."
          />
        </div>

        {!data.orders.length ? (
          <EmptyState
            title="Nothing waiting"
            hint="Every order has a driver. This is what you want to see."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Route</Th>
                <Th>Vehicle</Th>
                <Th>Fare</Th>
                <Th>Waiting</Th>
                <Th>Reached</Th>
                <Th>Radius</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-aiko-dark-50 dark:hover:bg-aiko-dark-800/50">
                  <Td>
                    <p className="font-medium">{order.pickupLocation}</p>
                    <p className="text-xs text-aiko-dark-500">→ {order.dropoffLocation}</p>
                  </Td>
                  <Td>{order.vehicleType}</Td>
                  <Td className="font-medium">{money(order.fare)}</Td>
                  <Td>
                    <span
                      className={
                        // Two minutes is roughly when a customer starts
                        // wondering whether the app is broken.
                        order.ageSeconds > 120 ? 'font-medium text-amber-600' : undefined
                      }>
                      {duration(order.ageSeconds)}
                    </span>
                  </Td>
                  <Td>
                    {order.offeredTo === 0 ? (
                      <Badge tone="red">Nobody</Badge>
                    ) : (
                      <Badge tone="neutral">
                        {order.offeredTo} driver{order.offeredTo === 1 ? '' : 's'}
                      </Badge>
                    )}
                  </Td>
                  <Td className="text-sm text-aiko-dark-500">
                    {order.searchRadiusKm ? `${order.searchRadiusKm} km` : '—'}
                    <span className="text-xs"> · pass {order.dispatchAttempts + 1}</span>
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
        )}
      </Card>

      {data.orders.some((order) => order.offeredTo === 0) ? (
        <p className="mt-4 text-sm text-aiko-dark-500">
          Orders marked <strong>Nobody</strong> have reached no drivers at all — there is nobody
          online within range for that vehicle type. Widening the radius will not help if the pool
          is empty.
        </p>
      ) : null}
    </>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <Card>
      <p className="text-sm text-aiko-dark-500">{label}</p>
      <p
        className={
          warn && value > 0
            ? 'mt-1 text-2xl font-semibold text-amber-600'
            : 'mt-1 text-2xl font-semibold text-aiko-dark-900 dark:text-white'
        }>
        {value}
      </p>
    </Card>
  );
}
