import type { Driver } from './type';

/**
 * The limit in force for this driver — their own override, else the platform
 * setting, as the server derived it. 0 means no limit.
 */
export function debtLimitOf(driver: Driver): number {
  return driver.debt?.limit ?? driver.debtLimit ?? 0;
}

/** At or over the limit: cannot go online or take new orders. */
export function isDebtLocked(driver: Driver): boolean {
  return Boolean(driver.debt?.locked);
}

/** Room left before the lock, or null when the driver has no limit. */
export function debtHeadroom(driver: Driver): number | null {
  const limit = debtLimitOf(driver);
  return limit > 0 ? limit - driver.currentDebt : null;
}
