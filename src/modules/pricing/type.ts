import type { VehicleType } from '@/modules/orders/type';

export interface PricingRule {
  id: string;
  vehicleType: VehicleType;
  baseFare: number;
  perKm: number;
  perMinute: number;
  minimumFare: number;
  bookingFee: number;
  surgeMultiplier: number;
  avgSpeedKph: number;
  platformFeePercent: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePricingVariables extends Partial<Omit<PricingRule, 'vehicleType'>> {
  vehicleType: VehicleType;
}
