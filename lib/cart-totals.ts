export const FREE_SHIPPING_THRESHOLD = 12000;
export const STANDARD_SHIPPING = 600;
export const TAX_RATE = 0.08;

export interface Totals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function computeTotals(subtotal: number): Totals {
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}
