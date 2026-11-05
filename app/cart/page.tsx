'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { formatMoney, getProduct, PRODUCTS, shippingFor, type Product } from '@/lib/data';
import { useStore } from '@/components/Store';
import { BoxIcon } from '@/components/Icons';
import ProductCard from '@/components/ProductCard';

const TRUST = [
  ['Paiement sécurisé', 'Aucune carte stockée sur AMIRCAL'],
  ['Suivi de commande', 'Numéro de suivi dès l’expédition'],
  ['Sans compte', 'Commande possible en invité'],
  ['Service client', 'Une équipe pour vous aider'],
];

function Img({ p }: { p: Product }) {
  // eslint-disable-next-line @next/next/no-img-element
  return p.image ? <img src={p.image} alt={p.name} loading='lazy' className='h-full w-full object-contain' /> : <BoxIcon className='h-8 w-8' />;
}

export default function CartPage() {
  const { cart, currency, setQty, remove } = useStore();
  const lines = cart.flatMap((l) => { const p = getProduct(l.id); return p ? [{ ...l, p }] : []; });
  const sub = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const ship = shippingFor(currency, sub);
  const threshold = currency === 'USD' ? 50 : 100;
  const left = Math.max(0, threshold - sub);
  const inCart = new Set(lines.map((l) => l.id));
  const cats = new Set(lines.map((l) => l.p.category));

  // Suggestions : si la livraison offerte est proche, les articles qui font atteindre le seuil ; sinon, des articles des mêmes catégories.
  const suggestions = useMemo(() => {
    const pool = PRODUCTS.filter((p) => p.stock > 0 && !inCart.has(p.id));
    const sorted = left > 0
      ? [...pool].sort((a, b) => Math.abs(a.price - left) - Math.abs(b.price - left))
      : [...pool].sort((a, b) => Number(cats.has(b.category)) - Number(cats.has(a.category)));
    return sorted.slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, cart.length]);

  if (!lines.length) return (
    <main className='mx-auto max-w-5xl px-4 py-12'>
      <div className='text-center'>
        <h1 className='mb-2 text-2xl font-bold'>Votre panier est vide</h1>
        <p className='mb-5 text-sm text-graphite'>Découvrez nos produits : livraison offerte dès {formatMoney(threshold, currency)} d’achats.</p>
        <Link href='/products' className='inline-block rounded bg-ink px-6 py-3 font-bold text-paper'>Parcourir le catalogue</Link>
      </div>
      <h2 className='mb-3 mt-10 text-xl font-bold'>Nos sélections</h2>
      <div className='grid grid-cols-2 gap-2.5 md:grid-cols-4'>{PRODUCTS.filter((p) => p.stock > 0).slice(0, 4).map((p) => (<ProductCard key={p.id} p={p} />))}</div>
    </main>
  );

  return (
    <main className='mx-auto max-w-5xl px-4 pb-24 pt-6 md:pb-10'>
      <h1 className='mb-4 text-2xl font-bold'>Panier ({lines.reduce((n, l) => n + l.qty, 0)})</h1>

      <div className='mb-5 border border-ink bg-soft p-3 text-sm'>
        {left > 0 ? <>Plus que <b>{formatMoney(left, currency)}</b> pour profiter de la <b>livraison offerte</b></> : <b>Livraison offerte appliquée à votre commande</b>}
        <div className='mt-2 h-2 w-full bg-neutral-300'><div className='h-full bg-ink transition-all' style={{ width: Math.min(100, (sub / threshold) * 100) + '%' }} /></div>
      </div>

      <div className='grid gap-6 md:grid-cols-[1fr_340px]'>
        <div>
          {lines.map((l) => (
            <div key={l.id + l.variant} className='flex gap-3 border-b border-neutral-200 py-3'>
              <Link href={'/products/' + l.id} className='grid h-24 w-24 flex-none place-items-center overflow-hidden bg-soft text-neutral-400'><Img p={l.p} /></Link>
              <div className='min-w-0 flex-1 text-sm'>
                <Link href={'/products/' + l.id} className='line-clamp-2 font-medium'>{l.p.name}</Link>
                {l.variant !== 'Standard' && <p className='text-neutral-600'>{l.variant}</p>}
                <p className='text-neutral-600'>{l.p.stock > 0 ? 'En stock' : 'Rupture de stock'}</p>
                <p className='mt-0.5 font-bold'>{formatMoney(l.p.price * l.qty, currency)}{l.qty > 1 && <span className='ml-1.5 text-xs font-normal text-neutral-500'>({formatMoney(l.p.price, currency)} l’unité)</span>}</p>
                <div className='mt-1.5 flex items-center gap-3'>
                  <span className='inline-flex rounded border border-ink'><button onClick={() => setQty(l.id, l.variant, l.qty - 1)} aria-label='Moins' className='h-9 w-9'>−</button><span className='grid w-9 place-items-center'>{l.qty}</span><button onClick={() => setQty(l.id, l.variant, l.qty + 1)} aria-label='Plus' className='h-9 w-9'>+</button></span>
                  <button onClick={() => remove(l.id, l.variant)} className='underline'>Retirer</button>
                </div>
              </div>
            </div>
          ))}
          <Link href='/products' className='mt-3 inline-block text-sm underline'>← Continuer mes achats</Link>
        </div>

        <aside className='self-start rounded border border-ink p-4 md:sticky md:top-32'>
          <h2 className='mb-3 font-bold'>Récapitulatif</h2>
          <dl className='space-y-1.5 text-sm'>
            <div className='flex justify-between'><dt>Sous-total</dt><dd>{formatMoney(sub, currency)}</dd></div>
            <div className='flex justify-between'><dt>Livraison</dt><dd>{ship === 0 ? 'Offerte' : formatMoney(ship, currency)}</dd></div>
            <div className='flex justify-between border-t border-neutral-300 pt-2 text-base font-bold'><dt>Total</dt><dd>{formatMoney(sub + ship, currency)}</dd></div>
          </dl>
          <p className='mt-2 text-xs text-neutral-600'>Livraison estimée : États-Unis 7 à 14 jours · Haïti 14 à 25 jours (provisoire).</p>
          <Link href='/checkout' className='mt-4 block rounded bg-ink py-3.5 text-center font-bold text-paper'>Passer la commande</Link>
          <ul className='mt-4 grid grid-cols-2 gap-2'>{TRUST.map(([t, d]) => (<li key={t} className='rounded border border-neutral-200 p-2 text-[11px] leading-snug'><b className='block text-xs'>{t}</b>{d}</li>))}</ul>
        </aside>
      </div>

      <section className='mt-10'>
        <h2 className='mb-3 text-xl font-bold'>{left > 0 ? 'Ajoutez ' + formatMoney(left, currency) + ' pour la livraison offerte' : 'Complétez votre commande'}</h2>
        <div className='flex gap-2.5 overflow-x-auto pb-2'>{suggestions.map((p) => (<div key={p.id} className='w-40 flex-none'><ProductCard p={p} /></div>))}</div>
      </section>

      <div className='fixed inset-x-0 bottom-14 z-30 flex items-center gap-3 border-t border-ink bg-paper px-4 py-2 md:hidden'>
        <div className='min-w-0 flex-1'><p className='text-xs text-neutral-600'>Total {ship === 0 ? '· livraison offerte' : ''}</p><b>{formatMoney(sub + ship, currency)}</b></div>
        <Link href='/checkout' className='flex h-11 items-center rounded bg-ink px-5 font-bold text-paper'>Commander</Link>
      </div>
    </main>
  );
}
