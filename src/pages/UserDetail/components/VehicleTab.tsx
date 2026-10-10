import { humanise } from '@/lib/format';
import type { UserOverview } from '@/modules/users/type';

const DOCUMENT_TYPES = ['DRIVER_LICENSE', 'NATIONAL_ID'];

export function VehicleTab({ user }: { user: UserOverview }) {
  const driver = user.driver;
  if (!driver) {
    return <p className="text-sm text-aiko-dark-500">No vehicle registered yet.</p>;
  }

  const photos = (driver.vehiclePhotos ?? []).filter((p) => !DOCUMENT_TYPES.includes(p.type));
  const rows = [
    { label: 'Type', value: humanise(driver.vehicleType) },
    { label: 'Plate', value: driver.vehiclePlate ?? '—' },
    { label: 'Brand', value: driver.vehicleBrand ?? '—' },
    { label: 'Model', value: driver.vehicleModel ?? '—' },
    { label: 'Colour', value: driver.vehicleColor ?? '—' },
    { label: 'Year', value: driver.vehicleYear ? String(driver.vehicleYear) : '—' },
    { label: 'Trips completed', value: String(driver.totalTrips ?? 0) },
  ];

  return (
    <div className="space-y-4">
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-2 rounded-lg bg-aiko-dark-50 px-3 py-2 dark:bg-aiko-dark-800/60">
            <dt className="text-aiko-dark-500">{row.label}</dt>
            <dd className="font-medium text-aiko-dark-900 dark:text-white">{row.value}</dd>
          </div>
        ))}
      </dl>

      {photos.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((photo) => (
            <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="block">
              <img
                src={photo.url}
                alt={photo.type}
                className="aspect-[4/3] w-full rounded-lg border border-aiko-dark-100 object-cover dark:border-aiko-dark-800"
              />
              <p className="mt-1 text-xs text-aiko-dark-500">{humanise(photo.type)}</p>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-aiko-dark-500">No vehicle photos uploaded.</p>
      )}
    </div>
  );
}
