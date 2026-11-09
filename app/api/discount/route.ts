import { NextResponse } from 'next/server';
import { sbPublic } from '@/lib/supabase/public';

// Limite simple : 10 essais par minute et par adresse IP (mémoire du serveur, au mieux).
const hits = new Map<string, { n: number; t: number }>();
const bad = (message: string, status = 200) => NextResponse.json({ valid: false, message }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'inconnu').split(',')[0].trim();
  const now = Date.now();
  const h = hits.get(ip);
  if (h && now - h.t < 60_000) {
    if (h.n >= 10) return bad('Trop de tentatives, réessayez dans une minute.', 429);
    h.n++;
  } else hits.set(ip, { n: 1, t: now });
  if (hits.size > 5000) hits.clear();

  const code = (new URL(req.url).searchParams.get('code') ?? '').trim().slice(0, 40);
  if (!code) return bad('Saisissez un code.');
  const { data, error } = await sbPublic().rpc('check_discount', { p_code: code });
  const row = ((data ?? []) as { valid: boolean; percent_off: number | null; amount_off_usd: number | string | null }[])[0];
  if (error || !row) return bad('Code invalide ou expiré.');
  return NextResponse.json({ valid: true, percent_off: row.percent_off, amount_off_usd: row.amount_off_usd }, { headers: { 'Cache-Control': 'no-store' } });
}
