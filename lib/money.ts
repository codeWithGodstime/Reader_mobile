export const TAX_RATE = 0.08;
export const FREE_SHIPPING_AT = 35;
export const EXPRESS_FEE = 4.99;
export const STANDARD_UNDER_FEE = 5.99;

export function cents(value: number) {
  return Math.round(value * 100) / 100;
}

export function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export function shippingCost(subtotal: number, speed: "standard" | "express") {
  const standard = subtotal >= FREE_SHIPPING_AT ? 0 : STANDARD_UNDER_FEE;
  return speed === "express" ? cents(standard + EXPRESS_FEE) : standard;
}

export function taxFor(subtotal: number) {
  return cents(subtotal * TAX_RATE);
}
