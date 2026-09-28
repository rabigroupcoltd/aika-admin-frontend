import type { VehicleType } from '@/modules/orders/type';

/**
 * One vehicle type's fare rule.
 *
 * Field names match the Prisma model exactly — `avgSpeedKph`, not
 * `averageSpeedKph`. A near-miss here silently sends a property the DTO drops,
 * and the save appears to succeed while changing nothing.
 */
export interface PricingRule {
  id: string;
  vehicleType: VehicleType;
  /** Charged before any distance. */
  baseFare: number;
  perKm: number;
  perMinute: number;
  /** Floor — short trips never quote below this. */
  minimumFare: number;
  bookingFee: number;
  /** 1 is normal pricing. Multiplies the whole fare. */
  surgeMultiplier: number;
  /** Turns distance into an ETA and into the per-minute charge. */
  avgSpeedKph: number;
  /** The cut Aiko keeps; the rest is the driver's earnings. */
  platformFeePercent: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePricingVariables extends Partial<Omit<PricingRule, 'vehicleType'>> {
  vehicleType: VehicleType;
}
