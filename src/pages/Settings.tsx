import { Card, CardHeader, PageHeader, Spinner } from '@/components/ui';
import { money } from '@/lib/format';
import { useGetAdminSummaryManager } from '@/modules/admin/adminController';

/**
 * Settings.
 *
 * Read-only for now, and deliberately so. Every dial the marketplace turns —
 * search radius, capacity, detour limits, heartbeat TTL — is read from the
 * environment at boot on the server, so a form here could not change them
 * without a deploy. Showing them is still worth doing: an operator debugging
 * "why did nobody get this order" needs to know what the radius actually is.
 *
 * Pricing is the exception and lives on its own screen, because it is stored in
 * the database and genuinely is editable.
 */
export function Settings() {
  const { data, isLoading } = useGetAdminSummaryManager();

  return (
    <>
      <PageHeader title="Settings" subtitle="How this deployment is configured." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Platform" subtitle="Current totals." />
          {isLoading ? (
            <Spinner />
          ) : (
            <dl className="space-y-2 text-sm">
              <Row label="Registered users" value={String(data?.users.total ?? 0)} />
              <Row label="Registered drivers" value={String(data?.drivers.total ?? 0)} />
              <Row label="Approved drivers" value={String(data?.drivers.approved ?? 0)} />
              <Row label="Orders all time" value={String(data?.orders.total ?? 0)} />
              <Row label="Revenue all time" value={money(data?.revenue.total)} />
            </dl>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Dispatch"
            subtitle="Set on the server, not here — changing these needs a deploy."
          />
          <dl className="space-y-2 text-sm">
            <Row label="Vehicles offered" value="Bike, Tricycle" />
            <Row label="Search radius" value="SEARCH_RADIUS_KM" mono />
            <Row label="Orders per driver" value="MAX_RESERVED_ORDERS_PER_DRIVER" mono />
            <Row label="Presence TTL" value="DRIVER_HEARTBEAT_TTL" mono />
            <Row label="Location flush" value="LOCATION_FLUSH_INTERVAL_MS" mono />
          </dl>
          <p className="mt-4 text-xs text-aiko-dark-500">
            The live values are served to the driver app at{' '}
            <code className="rounded bg-aiko-dark-100 px-1 dark:bg-aiko-dark-800">
              GET /api/marketplace/config
            </code>
            .
          </p>
        </Card>

        <Card>
          <CardHeader title="Pricing" subtitle="Stored in the database and editable." />
          <p className="text-sm text-aiko-dark-600 dark:text-aiko-dark-300">
            Fares, platform commission and surge live on the{' '}
            <a href="/pricing" className="font-medium text-aiko-green-600 hover:underline">
              Pricing &amp; Rate Card
            </a>{' '}
            screen.
          </p>
        </Card>

        <Card>
          <CardHeader title="Audit" subtitle="What is recorded." />
          <p className="text-sm text-aiko-dark-600 dark:text-aiko-dark-300">
            KYC approvals and rejections, driver blocks, and support ticket changes are written to
            the audit trail with the admin who made them. The trail is append-only — there is no
            endpoint that edits or deletes an entry.
          </p>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-aiko-dark-500">{label}</dt>
      <dd
        className={
          mono
            ? 'rounded bg-aiko-dark-100 px-1.5 py-0.5 font-mono text-xs text-aiko-dark-700 dark:bg-aiko-dark-800 dark:text-aiko-dark-300'
            : 'font-medium text-aiko-dark-900 dark:text-white'
        }>
        {value}
      </dd>
    </div>
  );
}
