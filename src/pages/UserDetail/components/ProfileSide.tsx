import { Badge, Card, CardHeader } from '@/components/ui';
import { humanise, shortDate } from '@/lib/format';
import type { UserOverview } from '@/modules/users/type';

export function ProfileSide({ user }: { user: UserOverview }) {
  const rows: { label: string; value: string }[] = [
    { label: 'Phone', value: user.phone ?? '—' },
    { label: 'Email', value: user.email ?? '—' },
    { label: 'Date of birth', value: user.dob ? shortDate(user.dob) : '—' },
    { label: 'Signed in with', value: humanise(user.authProvider.replace('FIREBASE_', '')) },
    { label: 'Joined', value: shortDate(user.createdAt) },
    { label: 'Last sign-in', value: user.lastLoginAt ? shortDate(user.lastLoginAt) : '—' },
  ];

  const checks = [
    { label: 'Profile photo', done: Boolean(user.profilePhotoUrl) },
    { label: 'Liveness check', done: Boolean(user.livenessPassedAt) },
    { label: 'Onboarding complete', done: Boolean(user.onboardingCompletedAt) },
  ];

  return (
    <div className="space-y-4">
      {user.profilePhotoUrl ? (
        <a
          href={user.profilePhotoUrl}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-xl border border-aiko-dark-100 dark:border-aiko-dark-800">
          <img src={user.profilePhotoUrl} alt="Selfie" className="aspect-square w-full object-cover" />
        </a>
      ) : null}

      <Card>
        <CardHeader title="Profile" />
        <dl className="space-y-2 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <dt className="text-aiko-dark-500">{row.label}</dt>
              <dd className="truncate text-right text-aiko-dark-900 dark:text-white">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <CardHeader title="Sign-up progress" subtitle={`Current step: ${humanise(user.onboardingStep)}`} />
        <ul className="space-y-2 text-sm">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center justify-between">
              <span>{check.label}</span>
              <Badge tone={check.done ? 'green' : 'neutral'}>{check.done ? 'Done' : 'Not yet'}</Badge>
            </li>
          ))}
        </ul>
        {user.isBlocked && user.blockedReason ? (
          <p className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
            Blocked: {user.blockedReason}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
