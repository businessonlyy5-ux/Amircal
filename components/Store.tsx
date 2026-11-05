'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Currency } from '@/lib/data';
import type { Lang } from '@/lib/i18n';

export type CartLine = { id: number; qty: number; variant: string };
type Ctx = {
  currency: Currency; setCurrency: (c: Currency) => void;
  lang: Lang; setLang: (l: Lang) => void;
  cart: CartLine[]; count: number;
  add: (id: number, qty?: number, variant?: string) => void;
  remove: (id: number, variant: string) => void;
  setQty: (id: number, variant: string, qty: number) => void;
  clear: () => void;
  wish: number[]; toggleWish: (id: number) => void;
  toast: string;
};
const C = createContext<Ctx | null>(null);
export function useStore() {
  const v = useContext(C);
  if (!v) throw new Error('StoreProvider manquant');
  return v;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [lang, setLang] = useState<Lang>('fr');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wish, setWish] = useState<number[]>([]);
  const [toast, setToast] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('amircal') ?? '{}');
      if (s.currency === 'USD' || s.currency === 'HTG') setCurrency(s.currency);
      if (s.lang === 'fr' || s.lang === 'en') setLang(s.lang);
      if (Array.isArray(s.cart)) setCart(s.cart);
      if (Array.isArray(s.wish)) setWish(s.wish);
    } catch { /* stockage indisponible */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem('amircal', JSON.stringify({ currency, lang, cart, wish })); } catch { /* ignore */ }
  }, [currency, lang, cart, wish, ready]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const say = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(''), 1600); }, []);
  const add = useCallback((id: number, qty = 1, variant = 'Standard') => {
    setCart((c) => {
      const f = c.find((l) => l.id === id && l.variant === variant);
      return f ? c.map((l) => (l === f ? { ...l, qty: Math.min(l.qty + qty, 10) } : l)) : [...c, { id, qty, variant }];
    });
    say(lang === 'en' ? 'Added to cart' : 'Ajouté au panier');
  }, [say, lang]);
  const remove = (id: number, variant: string) => setCart((c) => c.filter((l) => !(l.id === id && l.variant === variant)));
  const setQty = (id: number, variant: string, qty: number) => setCart((c) => c.map((l) => (l.id === id && l.variant === variant ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)));
  const toggleWish = (id: number) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  const count = cart.reduce((n, l) => n + l.qty, 0);

  return (
    <C.Provider value={{ currency, setCurrency, lang, setLang, cart, count, add, remove, setQty, clear: () => setCart([]), wish, toggleWish, toast }}>
      {children}
      <div role='status' aria-live='polite' className={'pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded bg-ink px-5 py-2 text-sm text-paper transition-opacity md:bottom-6 ' + (toast ? 'opacity-100' : 'opacity-0')}>{toast}</div>
    </C.Provider>
  );
}
