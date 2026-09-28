import { Card, CardHeader } from '@/components/ui';
import type { Driver } from '@/modules/drivers/type';

interface ProfileCardProps {
  driver: Driver;
}

export function ProfileCard({ driver }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader title="Profile" />
      <dl className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" value={driver.user?.phone ?? '—'} />
        <Field label="Email" value={driver.user?.email ?? '—'} />
        <Field label="Vehicle" value={driver.vehicleType} />
        <Field label="Plate" value={driver.vehiclePlate ?? '—'} />
        <Field label="Model" value={driver.vehicleModel ?? '—'} />
        <Field label="Colour" value={driver.vehicleColor ?? '—'} />
      </dl>
    </Card>
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
