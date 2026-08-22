import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Input,
  PageHeader,
  Spinner,
} from '@/components/ui';
import { dateTime, humanise, money, orderTone } from '@/lib/format';
import { useGetEntityHistoryManager } from '@/modules/audit/auditController';
import { CancelOrderManager, useGetOrderByIdManager } from '@/modules/orders/ordersController';
import { parseApiError } from '@/utils/parseApiError';

/** Statuses past the point where cancelling is a sensible admin action. */
const TERMINAL = ['DELIVERED', 'COMPLETED', 'CANCELLED', 'NO_DRIVER_FOUND'];

export function OrderDetail() {
  const { id = '' } = useParams();
  const [reason, setReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { data: order, isLoading, isError, error, refetch } = useGetOrderByIdManager({
    orderId: id,
  });

  // The trail for this specific order — who touched it and why.
  const { data: history } = useGetEntityHistoryManager({ entity: 'ORDER', entityId: id });

  const { cancelOrder, isLoading: cancelling } = CancelOrderManager();

  async function handleCancel() {
    setCancelError(null);

    try {
      await cancelOrder({ id, reason: reason.trim() });
      setReason('');
    } catch (e) {
      // useApiManager already raised a toast; this puts the same sentence next
      // to the field that caused it.
      setCancelError(parseApiError(e));
    }
  }

  if (isLoading) return <Spinner label="Loading order…" />;
  if (isError || !order) {
    return <ErrorState message={error?.message ?? 'Could not load this order.'} onRetry={refetch} />;
  }

  const canCancel = !TERMINAL.includes(order.status);

  return (
    <>
      <Link
        to="/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-aiko-dark-500 hover:text-aiko-green-600">
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <PageHeader
        title={`${order.pickupLocation} → ${order.dropoffLocation}`}
        subtitle={`Placed ${dateTime(order.createdAt)}`}
        action={<Badge tone={orderTone(order.status)}>{humanise(order.status)}</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Delivery" />
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="What is being sent" value={order.description || 'Not specified'} />
              <Field label="Vehicle" value={order.vehicleType} />
              <Field label="Pickup" value={order.pickupLocation} />
              <Field label="Drop-off" value={order.dropoffLocation} />
              <Field label="Distance" value={`${order.distanceKm.toFixed(1)} km`} />
              <Field label="Estimated duration" value={`${Math.round(order.durationMins)} min`} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Money" />
            <dl className="grid gap-4 sm:grid-cols-3">
              <Field label="Fare" value={money(order.fare, order.currency)} />
              <Field label="Driver earns" value={money(order.driverEarnings, order.currency)} />
              <Field label="Platform fee" value={money(order.platformFee, order.currency)} />
              <Field label="Method" value={humanise(order.paymentMethod)} />
              <Field label="Payment" value={humanise(order.paymentStatus)} />
            </dl>
          </Card>

          {order.cancellationReason ? (
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
              <CardHeader title="Cancellation reason" />
              <p className="text-sm text-red-700 dark:text-red-200">{order.cancellationReason}</p>
            </Card>
          ) : null}

          <Card>
            <CardHeader
              title="Admin history"
              subtitle="Actions staff have taken on this order."
            />
            {!history?.length ? (
              <p className="text-sm text-aiko-dark-500">
                Nothing yet — no admin has touched this order.
              </p>
            ) : (
              <ul className="divide-y divide-aiko-dark-100 dark:divide-aiko-dark-800">
                {history.map((entry) => (
                  <li key={entry.id} className="py-3">
                    <p className="text-sm text-aiko-dark-800 dark:text-aiko-dark-200">
                      {entry.summary}
                    </p>
                    <p className="text-xs text-aiko-dark-500">
                      {entry.actorName ?? 'System'} · {dateTime(entry.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Customer" />
            <p className="text-sm font-medium text-aiko-dark-900 dark:text-white">
              {order.user?.name ?? 'Unknown'}
            </p>
            <p className="text-sm text-aiko-dark-500">{order.user?.phone ?? '—'}</p>
          </Card>

          <Card>
            <CardHeader title="Driver" />
            {order.driver ? (
              <>
                <p className="text-sm font-medium text-aiko-dark-900 dark:text-white">
                  {order.driver.user?.name ?? 'Unknown'}
                </p>
                <p className="text-sm text-aiko-dark-500">{order.driver.user?.phone ?? '—'}</p>
                <p className="mt-1 text-xs text-aiko-dark-500">
                  {order.driver.vehicleType}
                  {order.driver.vehiclePlate ? ` · ${order.driver.vehiclePlate}` : ''}
                </p>
                <Link
                  to={`/drivers/${order.driver.id}`}
                  className="mt-3 inline-block text-sm font-medium text-aiko-green-600 hover:underline">
                  View driver →
                </Link>
              </>
            ) : (
              <p className="text-sm text-aiko-dark-500">Nobody has claimed this order.</p>
            )}
          </Card>

          {canCancel ? (
            <Card>
              <CardHeader
                title="Cancel order"
                subtitle="The reason is shown to both parties and recorded in the audit trail."
              />
              <Input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Why is this being cancelled?"
              />
              {cancelError ? <p className="mt-2 text-sm text-red-600">{cancelError}</p> : null}
              <Button
                variant="danger"
                className="mt-3 w-full"
                loading={cancelling}
                // Cancelling without a reason is what makes an order impossible
                // to explain later, so it is not allowed here.
                disabled={reason.trim().length < 3}
                onClick={() => void handleCancel()}>
                Cancel this order
              </Button>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-aiko-dark-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-aiko-dark-900 dark:text-white">{value}</dd>
    </div>
  );
}
