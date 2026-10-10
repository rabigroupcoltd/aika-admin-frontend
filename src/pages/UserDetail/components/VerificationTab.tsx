import { Badge } from '@/components/ui';
import { humanise, shortDate } from '@/lib/format';
import type { UserOverview } from '@/modules/users/type';
import { KycApprovalCard } from '../../DriverDetail/components/KycApprovalCard';
import { KycRejectionCard } from '../../DriverDetail/components/KycRejectionCard';

const DOCUMENT_TYPES = ['DRIVER_LICENSE', 'NATIONAL_ID', 'FRONT', 'PLATE_NUMBER'];

const DOCUMENT_LABEL: Record<string, string> = {
  DRIVER_LICENSE: "Driver's licence",
  NATIONAL_ID: 'National ID',
  FRONT: 'Vehicle photo',
  PLATE_NUMBER: 'Plate close-up',
};

interface VerificationTabProps {
  user: UserOverview;
  isAdmin: boolean;
  approving: boolean;
  rejecting: boolean;
  onApprove: () => Promise<unknown>;
  onReject: (reason: string) => Promise<unknown>;
}

/**
 * Everything needed to decide on a driver, side by side: the selfie they
 * signed up with, their documents at a readable size, and the vehicle details
 * they typed — with approve and reject right below.
 */
export function VerificationTab({
  user,
  isAdmin,
  approving,
  rejecting,
  onApprove,
  onReject,
}: VerificationTabProps) {
  const driver = user.driver;

  if (!driver) {
    return (
      <div className="rounded-lg bg-aiko-dark-50 p-4 text-sm text-aiko-dark-600 dark:bg-aiko-dark-800/60 dark:text-aiko-dark-300">
        <p className="font-medium text-aiko-dark-900 dark:text-white">No documents yet</p>
        <p className="mt-1">
          {user.name ?? 'This user'} chose to drive but hasn&apos;t submitted their licence, ID and
          vehicle details. There&apos;s nothing to approve until they do — reach them on{' '}
          {user.phone ?? user.email ?? 'their contact details'} and ask them to finish the
          documents step in the app.
        </p>
      </div>
    );
  }

  const documents = (driver.vehiclePhotos ?? []).filter((p) => DOCUMENT_TYPES.includes(p.type));
  const missing = DOCUMENT_TYPES.filter((type) => !documents.some((d) => d.type === type));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-aiko-dark-500">Submitted {shortDate(driver.createdAt)}</span>
        <Badge tone={driver.kycStatus === 'APPROVED' ? 'green' : driver.kycStatus === 'REJECTED' ? 'red' : 'amber'}>
          {humanise(driver.kycStatus)}
        </Badge>
      </div>

      {driver.kycStatus === 'REJECTED' && driver.kycRejectionReason ? (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          Rejected: {driver.kycRejectionReason}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DocumentTile label="Selfie (from sign-up)" url={user.profilePhotoUrl} />
        {DOCUMENT_TYPES.map((type) => (
          <DocumentTile
            key={type}
            label={DOCUMENT_LABEL[type]}
            url={documents.find((d) => d.type === type)?.url ?? null}
          />
        ))}
      </div>

      {missing.length ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Missing: {missing.map((type) => DOCUMENT_LABEL[type]).join(', ')}. Older submissions may
          have uploaded these as vehicle photos — check the Vehicle tab.
        </p>
      ) : null}

      <dl className="grid gap-2 rounded-lg bg-aiko-dark-50 p-4 text-sm sm:grid-cols-2 dark:bg-aiko-dark-800/60">
        <Field label="Vehicle" value={humanise(driver.vehicleType)} />
        <Field label="Plate" value={driver.vehiclePlate ?? '—'} />
        <Field label="Brand" value={driver.vehicleBrand ?? '—'} />
        <Field label="Model" value={driver.vehicleModel ?? '—'} />
        <Field label="Colour" value={driver.vehicleColor ?? '—'} />
      </dl>

      {isAdmin ? (
        <div className="grid gap-4 md:grid-cols-2">
          {driver.kycStatus !== 'APPROVED' ? (
            <KycApprovalCard loading={approving} onApprove={onApprove} />
          ) : null}
          {driver.kycStatus !== 'REJECTED' ? (
            <KycRejectionCard loading={rejecting} onReject={onReject} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DocumentTile({ label, url }: { label: string; url: string | null }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-aiko-dark-500">{label}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          title="Open full size"
          className="block overflow-hidden rounded-lg border border-aiko-dark-100 dark:border-aiko-dark-800">
          <img src={url} alt={label} className="aspect-[4/3] w-full object-cover transition-transform hover:scale-105" />
        </a>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-aiko-dark-200 text-xs text-aiko-dark-400 dark:border-aiko-dark-700">
          Not uploaded
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-aiko-dark-500">{label}</dt>
      <dd className="font-medium text-aiko-dark-900 dark:text-white">{value}</dd>
    </div>
  );
}
