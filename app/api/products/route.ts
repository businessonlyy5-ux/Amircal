import { NextResponse } from 'next/server';
import { getProductsByIds } from '@/lib/products';

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get('ids') ?? '';
  const ids = raw.split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 40);
  const products = await getProductsByIds(ids);
  return NextResponse.json({ products }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
