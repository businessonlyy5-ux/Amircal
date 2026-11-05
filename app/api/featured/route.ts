import { NextResponse } from 'next/server';
import { listProducts } from '@/lib/products';

// Sélection de produits (suggestions du panier) : par catégorie et/ou tranche de prix en USD.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const n = Math.min(12, Math.max(1, Number(sp.get('n')) || 6));
  const min = Number(sp.get('min')) || undefined;
  const max = Number(sp.get('max')) || undefined;
  const r = await listProducts({ cat: sp.get('cat') || undefined, min, max, per: n });
  return NextResponse.json({ products: r.items }, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
}
