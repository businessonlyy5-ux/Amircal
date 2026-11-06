// Types, constantes et formats communs. Produits, catégories et taux viennent de Supabase (lib/products.ts, lib/categories.ts, lib/rate.ts).
export type Currency = 'USD' | 'HTG';
export type Product = {
  id: number; // identifiant Zendrop (supplier_product_id)
  name: string; category: string;
  price: number; compareAt: number; discount: number; rating: number; stock: number;
  image?: string; images?: string[]; description?: string;
};

export const MARGIN = 2.5; // provisoire : prix affiché = prix Zendrop x MARGIN
// Taux USD -> HTG : valeur par défaut, remplacée au chargement par la table exchange_rates (voir RateInit).
export let RATE_HTG = 131;
export function setRate(r: number) { if (Number.isFinite(r) && r > 0) RATE_HTG = r; }
export const VARIANTS = { Couleur: ['Noir', 'Blanc', 'Gris'], Taille: ['S', 'M', 'L'] };

export function formatMoney(usd: number, cur: Currency) {
  return cur === 'USD' ? '$' + usd.toFixed(2) : Math.round(usd * RATE_HTG).toLocaleString('fr-FR') + ' HTG';
}
// Frais de port provisoires (à remplacer par les vrais tarifs fournisseur).
export function shippingFor(cur: Currency, subtotalUsd: number) {
  if (subtotalUsd === 0) return 0;
  return cur === 'USD' ? (subtotalUsd >= 50 ? 0 : 4.99) : subtotalUsd >= 100 ? 0 : 12.99;
}
