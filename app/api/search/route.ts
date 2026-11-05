import { NextResponse } from 'next/server';
import { listProducts } from '@/lib/products';

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get('q') ?? '').trim();
  if (q.length < 2) return NextResponse.json({ products: [] });
  const r = await listProducts({ q, per: 5 });
  return NextResponse.json({ products: r.items.map((p) => ({ id: p.id, name: p.name })) }, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
}
