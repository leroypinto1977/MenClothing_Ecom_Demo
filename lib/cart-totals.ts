export const FREE_SHIPPING_THRESHOLD = 12000;
export const STANDARD_SHIPPING = 600;
export const TAX_RATE = 0.08;

export interface Totals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface TotalsConfig {
  freeShippingThreshold: number;
  standardShipping: number;
  /** Fractional rate, e.g. 0.08 for 8%. */
  taxRate: number;
}

export const DEFAULT_TOTALS_CONFIG: TotalsConfig = {
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  standardShipping: STANDARD_SHIPPING,
  taxRate: TAX_RATE,
};

export function computeTotals(
  subtotal: number,
  config: TotalsConfig = DEFAULT_TOTALS_CONFIG
): Totals {
  const shipping =
    subtotal === 0 || subtotal >= config.freeShippingThreshold
      ? 0
      : config.standardShipping;
  const tax = Math.round(subtotal * config.taxRate);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}
