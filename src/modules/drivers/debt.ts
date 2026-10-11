import type { Driver } from './type';

export function debtLimitOf(driver: Driver): number {
  return driver.debt?.limit ?? driver.debtLimit ?? 0;
}

export function isDebtLocked(driver: Driver): boolean {
  return Boolean(driver.debt?.locked);
}

export function debtHeadroom(driver: Driver): number | null {
  const limit = debtLimitOf(driver);
  return limit > 0 ? limit - driver.currentDebt : null;
}
