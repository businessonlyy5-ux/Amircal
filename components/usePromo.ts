'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Promo } from '@/lib/discounts';

const KEY = 'amircal_promo';
const EVT = 'amircal-promo';
function read(): Promo | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return v && typeof v.code === 'string' ? (v as Promo) : null;
  } catch { return null; }
}

// Code promo mémorisé dans le navigateur ; il est re-vérifié côté serveur (route /api/discount) à l’application.
export function usePromo() {
  const [promo, setPromo] = useState<Promo | null>(null);
  useEffect(() => {
    const sync = () => setPromo(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener('storage', sync); };
  }, []);
  const apply = useCallback(async (code: string): Promise<{ ok: boolean; message: string }> => {
    const c = code.trim();
    if (!c) return { ok: false, message: 'Saisissez un code.' };
    try {
      const r = await fetch('/api/discount?code=' + encodeURIComponent(c));
      const d = (await r.json()) as { valid: boolean; percent_off?: number | null; amount_off_usd?: number | string | null; message?: string };
      if (!r.ok || !d.valid) return { ok: false, message: d.message ?? 'Code invalide ou expiré.' };
      const p: Promo = { code: c.toUpperCase(), percent: d.percent_off ?? null, amount: d.amount_off_usd ? Number(d.amount_off_usd) : null };
      localStorage.setItem(KEY, JSON.stringify(p));
      window.dispatchEvent(new Event(EVT));
      return { ok: true, message: 'Code appliqué.' };
    } catch {
      return { ok: false, message: 'Réseau indisponible, réessayez.' };
    }
  }, []);
  const clear = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    window.dispatchEvent(new Event(EVT));
  }, []);
  return { promo, apply, clear };
}
