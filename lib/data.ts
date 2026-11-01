// DONNÉES DE DÉMONSTRATION : seront remplacées par le catalogue Supabase / Zendrop.
export type Currency = 'USD' | 'HTG';
export type Product = { id: number; name: string; category: string; price: number; compareAt: number; discount: number; rating: number; stock: number };

export const RATE_HTG = 131; // valeur provisoire, à lire depuis la table exchange_rates
export const CATEGORIES = ['Électronique', 'Maison & Cuisine', 'Mode homme', 'Mode femme', 'Enfants & Bébé', 'Beauté & Soins', 'Auto', 'Sports & Plein air', 'Jouets & Jeux', 'Animaux', 'Bureau', 'Bricolage'];
const BASE = ['Écouteurs sans fil', 'Mixeur portable', 'Montre connectée', 'Sac à dos', 'Lampe LED', 'Tapis de yoga', 'Set de casseroles', 'Support téléphone', 'Jeu de construction', 'Sérum hydratant', 'Coussin de voyage', 'Boîte à outils', 'Brosse pour animaux', 'Chaussures de course', 'Bouteille isotherme', 'Organiseur de bureau'];

export const PRODUCTS: Product[] = Array.from({ length: 48 }, (_, i) => {
  const price = 8 + ((i * 13) % 62) + 0.99;
  const discount = [0, 0, 15, 25, 0, 30, 0, 10][i % 8];
  return {
    id: i + 1,
    name: BASE[i % 16] + (i >= 16 ? ' Série ' + (Math.floor(i / 16) + 1) : ''),
    category: CATEGORIES[(i * 5) % 12],
    price,
    compareAt: discount ? Math.round((price / (1 - discount / 100)) * 100) / 100 : 0,
    discount,
    rating: i % 4 ? +(3.6 + ((i * 7) % 14) / 10).toFixed(1) : 0,
    stock: i % 9 === 5 ? 0 : 5 + ((i * 11) % 60),
  };
});

export const VARIANTS = { Couleur: ['Noir', 'Blanc', 'Gris'], Taille: ['S', 'M', 'L'] };

export function formatMoney(usd: number, cur: Currency) {
  return cur === 'USD' ? '$' + usd.toFixed(2) : Math.round(usd * RATE_HTG).toLocaleString('fr-FR') + ' HTG';
}
// Frais de port provisoires (à remplacer par les vrais tarifs fournisseur).
export function shippingFor(cur: Currency, subtotalUsd: number) {
  if (subtotalUsd === 0) return 0;
  return cur === 'USD' ? (subtotalUsd >= 50 ? 0 : 4.99) : subtotalUsd >= 100 ? 0 : 12.99;
}
export const getProduct = (id: number) => PRODUCTS.find((p) => p.id === id);
