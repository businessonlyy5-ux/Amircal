// Remises réelles du panier (aucun prix de référence inventé) : remise sur la quantité ou code promo.
// Elles ne se cumulent pas : on applique la meilleure des deux, ce qui protège la marge (>= 28 % après remise de 10 %).
export const QTY_TIERS = [{ min: 3, pct: 10 }, { min: 2, pct: 5 }] as const;
export const qtyPct = (n: number) => QTY_TIERS.find((t) => n >= t.min)?.pct ?? 0;

export type Promo = { code: string; percent: number | null; amount: number | null }; // amount : USD
export type Applied = { amount: number; kind: 'promo' | 'qty' | null; code: string | null; pct: number | null };

export function bestDiscount(sub: number, qty: number, promo?: Promo | null): Applied {
  const q = Math.round(sub * qtyPct(qty)) / 100;
  let p = 0;
  if (promo) p = promo.percent ? Math.round(sub * promo.percent) / 100 : promo.amount ?? 0;
  p = Math.min(Math.max(p, 0), sub);
  if (promo && p > 0 && p >= q) return { amount: p, kind: 'promo', code: promo.code, pct: promo.percent };
  if (q > 0) return { amount: q, kind: 'qty', code: null, pct: qtyPct(qty) };
  return { amount: 0, kind: null, code: null, pct: null };
}
