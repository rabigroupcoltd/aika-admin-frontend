/**
 * A global numeric knob, backed by the server's `PlatformSetting` table —
 * distinct from a per-vehicle `PricingRule` (see `modules/pricing`).
 */
export interface PlatformSetting {
  key: string;
  /** Human name for the setting. */
  label?: string;
  value: number;
  /** Lowest value the server accepts. */
  min?: number;
  description: string;
  updatedAt: string | null;
}

export interface UpdatePlatformSettingVariables {
  key: string;
  value: number;
}
