'use client';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/data';

const cache = new Map<number, Product>();
const tried = new Set<number>();

// Charge les produits (panier, favoris, consultés récemment) par identifiant, avec un cache mémoire.
export function useProductsByIds(ids: number[]) {
  const [, bump] = useState(0);
  const key = ids.join(',');
  useEffect(() => {
    const need = ids.filter((i) => !cache.has(i) && !tried.has(i));
    if (!need.length) return;
    let live = true;
    (async () => {
      for (let i = 0; i < need.length; i += 40) {
        const chunk = need.slice(i, i + 40);
        try {
          const r = await fetch('/api/products?ids=' + chunk.join(','));
          const d = (await r.json()) as { products: Product[] };
          d.products.forEach((p) => cache.set(p.id, p));
        } catch { /* réseau indisponible */ }
        chunk.forEach((id) => tried.add(id));
      }
      if (live) bump((n) => n + 1);
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { get: (id: number) => cache.get(id), loading: ids.some((i) => !cache.has(i) && !tried.has(i)) };
}
