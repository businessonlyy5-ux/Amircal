// Alerte de stock bas : affichée quand il reste LOW_STOCK articles ou moins (très bas : VERY_LOW_STOCK ou moins).
// Le stock réel n’est pas encore synchronisé avec le fournisseur (valeur fixe de 25) : tant que c’est le cas, aucune alerte n’est montrée.
// DEMO_STOCK=1 (variable d’environnement Render) simule des niveaux variés pour les démonstrations. À RETIRER avant l’ouverture des ventes.
export const LOW_STOCK = 14;
export const VERY_LOW_STOCK = 5;

export function demoStockOn() {
  return process.env.DEMO_STOCK === '1';
}

const hash = (n: number, salt: number) => Math.abs(Math.imul((n | 0) ^ salt, 2654435761)) % 1000;

// Stock affiché pour un produit : le stock réel, ou, en mode démonstration, un niveau d’exemple.
// Répartition d’exemple : ~25 % très bas (2 à 5), ~35 % bas (6 à 14), ~25 % correct (15 à 30), ~15 % confortable (31 à 120).
// Toujours la même valeur pour un même produit : rien ne bouge au fil du temps.
export function stockFor(id: number, real: number) {
  if (!demoStockOn()) return real;
  const bucket = hash(id, 0x5bd1e995) % 100;
  const r = hash(id, 0x1b873593);
  if (bucket < 25) return 2 + (r % 4);
  if (bucket < 60) return 6 + (r % 9);
  if (bucket < 85) return 15 + (r % 16);
  return 31 + (r % 90);
}
