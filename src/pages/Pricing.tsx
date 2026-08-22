import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Spinner,
} from '@/components/ui';
import { dateTime, money } from '@/lib/format';
import {
  UpdatePricingRuleManager,
  useGetPricingRulesManager,
  type PricingRule,
} from '@/modules/pricing/pricingController';
import { parseApiError } from '@/utils/parseApiError';

/** The editable numbers, with what each one actually does to a fare. */
const FIELDS: { key: keyof PricingRule; label: string; hint: string; step?: string }[] = [
  { key: 'baseFare', label: 'Base fare', hint: 'Charged before any distance' },
  { key: 'perKm', label: 'Per km', hint: 'Straight-line distance × road factor' },
  { key: 'perMinute', label: 'Per minute', hint: 'Against the estimated duration' },
  { key: 'minimumFare', label: 'Minimum fare', hint: 'Floor — short trips never go below this' },
  { key: 'bookingFee', label: 'Booking fee', hint: 'Flat, added after the distance maths' },
  {
    key: 'surgeMultiplier',
    label: 'Surge',
    hint: '1 is normal pricing. Multiplies the whole fare.',
    step: '0.1',
  },
  {
    key: 'avgSpeedKph',
    label: 'Average speed (kph)',
    hint: 'Turns distance into an ETA and into the per-minute charge',
  },
  {
    key: 'platformFeePercent',
    label: 'Platform fee (%)',
    hint: 'The cut Aiko keeps — the rest is the driver’s earnings',
  },
];

/**
 * The rate card.
 *
 * One editable card per vehicle type, because a rule only ever changes for one
 * vehicle at a time and a single wide table of eight numbers across five rows
 * invites editing the wrong line.
 */
export function Pricing() {
  const { data, isLoading, isError, error, refetch } = useGetPricingRulesManager();

  if (isLoading) return <Spinner label="Loading rate card…" />;
  if (isError) {
    return (
      <ErrorState message={error?.message ?? 'Could not load the rate card.'} onRetry={refetch} />
    );
  }

  return (
    <>
      <PageHeader
        title="Pricing & Rate Card"
        subtitle="What every delivery costs, per vehicle type."
      />

      {!data?.length ? (
        <Card>
          <EmptyState
            title="No pricing rules"
            hint="Seed the pricing table before drivers can be quoted."
          />
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {data.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      )}
    </>
  );
}

function RuleCard({ rule }: { rule: PricingRule }) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const { updatePricingRule, isLoading: saving } = UpdatePricingRuleManager();

  async function save() {
    setSaveError(null);

    // Only what was actually touched. Sending every field back would overwrite
    // a value another admin changed between this page loading and Save.
    const edited = Object.fromEntries(
      Object.entries(draft)
        .filter(([, value]) => value !== '')
        .map(([key, value]) => [key, Number(value)]),
    );

    try {
      await updatePricingRule({ vehicleType: rule.vehicleType, ...edited });
      setDraft({});
    } catch (e) {
      setSaveError(parseApiError(e));
    }
  }

  const dirty = Object.values(draft).some((value) => value !== '');

  /** A worked example, so the numbers above mean something before saving. */
  const sample = (() => {
    const value = (key: keyof PricingRule) => {
      const edited = draft[key as string];
      return edited !== undefined && edited !== '' ? Number(edited) : (rule[key] as number);
    };

    const km = 5;
    const minutes = (km / (value('avgSpeedKph') || 25)) * 60;
    const raw =
      value('baseFare') +
      value('perKm') * km +
      value('perMinute') * minutes +
      value('bookingFee');
    const fare = Math.max(raw * (value('surgeMultiplier') || 1), value('minimumFare'));

    return {
      fare: Math.round(fare),
      driver: Math.round(fare * (1 - value('platformFeePercent') / 100)),
    };
  })();

  return (
    <Card>
      <CardHeader
        title={rule.vehicleType}
        subtitle={`Last changed ${dateTime(rule.updatedAt)}`}
        action={
          rule.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="neutral">Inactive</Badge>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key as string}>
            <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
              {field.label}
            </label>
            <Input
              type="number"
              step={field.step ?? '1'}
              // Uncontrolled until touched: the placeholder shows the live value
              // so an untouched field is visibly "unchanged" rather than looking
              // like a value that will be resubmitted.
              value={draft[field.key as string] ?? ''}
              placeholder={String(rule[field.key])}
              onChange={(event) =>
                setDraft((current) => ({ ...current, [field.key as string]: event.target.value }))
              }
            />
            <p className="mt-1 text-xs text-aiko-dark-500">{field.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-aiko-dark-50 p-3 text-sm dark:bg-aiko-dark-800">
        <p className="font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
          A 5 km delivery would cost {money(sample.fare, rule.currency)}
        </p>
        <p className="mt-0.5 text-xs text-aiko-dark-500">
          Driver keeps {money(sample.driver, rule.currency)}
        </p>
      </div>

      {saveError ? <p className="mt-3 text-sm text-red-600">{saveError}</p> : null}

      <div className="mt-4 flex gap-2">
        <Button loading={saving} disabled={!dirty} onClick={() => void save()}>
          Save changes
        </Button>
        {dirty ? (
          <Button variant="ghost" onClick={() => setDraft({})}>
            Discard
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
