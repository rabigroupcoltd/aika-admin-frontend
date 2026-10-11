import { useState } from 'react';
import { Badge, Button, Card, CardHeader, Input, PageHeader, Spinner } from '@/components/ui';
import { dateTime, money } from '@/lib/format';
import { useGetAdminSummaryManager } from '@/modules/admin/adminController';
import {
  UpdatePlatformSettingManager,
  useGetPlatformSettingsManager,
} from '@/modules/settings/settingsController';
import type { PlatformSetting } from '@/modules/settings/type';
import { parseApiError } from '@/utils/parseApiError';

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

        <PlatformSettingsCard />

        <Card>
          <CardHeader title="Commission & pricing" subtitle="Per-vehicle rate cards." />
          <p className="text-sm text-aiko-dark-600 dark:text-aiko-dark-300">
            The commission percentage taken from each trip, fares and surge are set per vehicle on the{' '}
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

function PlatformSettingsCard() {
  const { data, isLoading, isError, error, refetch } = useGetPlatformSettingsManager();

  return (
    <Card>
      <CardHeader
        title="Platform settings"
        subtitle="Global, not per-vehicle — each takes effect immediately."
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-sm text-red-600">{error?.message ?? 'Could not load settings.'}</p>
          <Button variant="ghost" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : !data?.length ? (
        <p className="text-sm text-aiko-dark-500">No platform settings found.</p>
      ) : (
        <div className="space-y-4">
          {data.map((setting) => (
            <SettingRow key={setting.key} setting={setting} />
          ))}
        </div>
      )}
    </Card>
  );
}

function SettingRow({ setting }: { setting: PlatformSetting }) {
  const [draft, setDraft] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const { updateSetting, isLoading: saving } = UpdatePlatformSettingManager();

  const dirty = draft !== '' && Number(draft) !== setting.value;

  async function save() {
    setSaveError(null);
    try {
      await updateSetting({ key: setting.key, value: Number(draft) });
      setDraft('');
    } catch (e) {
      setSaveError(parseApiError(e));
    }
  }

  return (
    <div className="rounded-lg border border-aiko-dark-100 p-3 dark:border-aiko-dark-800">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-aiko-dark-900 dark:text-white">
            {setting.label ?? setting.key}
          </p>
          <p className="text-xs text-aiko-dark-500">
            Current: <span className="font-medium">{setting.value.toLocaleString()}</span>
          </p>
        </div>
        {setting.updatedAt ? (
          <Badge tone="neutral">Changed {dateTime(setting.updatedAt)}</Badge>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-aiko-dark-500">{setting.description}</p>

      <div className="mt-2 flex items-center gap-2">
        <Input
          type="number"
          step="0.01"
          min={setting.min}
          className="max-w-[10rem]"
          value={draft}
          placeholder={String(setting.value)}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button loading={saving} disabled={!dirty} onClick={() => void save()}>
          Save
        </Button>
      </div>

      {saveError ? <p className="mt-2 text-sm text-red-600">{saveError}</p> : null}
    </div>
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
