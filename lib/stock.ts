// Alerte de stock bas : affichée quand il reste LOW_STOCK articles ou moins.
// Le stock réel n’est pas encore synchronisé avec le fournisseur (valeur fixe de 25) : tant que c’est le cas, aucune alerte n’est montrée.
// DEMO_STOCK=1 (variable d’environnement Render) simule des niveaux bas pour les démonstrations. À RETIRER avant l’ouverture des ventes.
export const LOW_STOCK = 14;

export function demoStockOn() {
  return process.env.DEMO_STOCK === '1';
}

// Stock affiché pour un produit : le stock réel, ou un niveau d’exemple (3 à 14, toujours le même pour un même produit) en mode démonstration.
export function stockFor(id: number, real: number) {
  if (!demoStockOn()) return real;
  const h = Math.abs(Math.imul(id | 0, 2654435761)) % 997;
  return 3 + (h % 12);
}
