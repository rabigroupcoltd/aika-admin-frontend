/**
 * A global numeric knob, backed by the server's `PlatformSetting` table —
 * distinct from a per-vehicle `PricingRule` (see `modules/pricing`).
 */
export interface PlatformSetting {
  key: string;
  value: number;
  description: string;
  updatedAt: string | null;
}

export interface UpdatePlatformSettingVariables {
  key: string;
  value: number;
}
