'use client';
import Link from 'next/link';
import { formatMoney, getProduct, shippingFor } from '@/lib/data';
import { useStore } from '@/components/Store';
import { BoxIcon } from '@/components/Icons';

export default function CartPage() {
  const { cart, currency, setQty, remove } = useStore();
  const lines = cart.flatMap((l) => { const p = getProduct(l.id); return p ? [{ ...l, p }] : []; });
  const sub = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const ship = shippingFor(currency, sub);
  if (!lines.length) return (<main className='mx-auto max-w-3xl px-4 py-16 text-center'><h1 className='mb-3 text-2xl font-bold'>Votre panier est vide</h1><Link href='/products' className='inline-block rounded bg-ink px-6 py-3 font-bold text-paper'>Parcourir le catalogue</Link></main>);
  return (
    <main className='mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[1fr_320px]'>
      <div>
        <h1 className='mb-4 text-2xl font-bold'>Panier</h1>
        {lines.map((l) => (
          <div key={l.id + l.variant} className='flex gap-3 border-b border-neutral-200 py-3'>
            <Link href={'/products/' + l.id} className='grid h-20 w-20 flex-none place-items-center bg-soft text-neutral-400'><BoxIcon className='h-8 w-8' /></Link>
            <div className='min-w-0 flex-1 text-sm'>
              <Link href={'/products/' + l.id} className='font-medium'>{l.p.name}</Link>
              <p className='text-neutral-600'>{l.variant}</p>
              <p className='font-bold'>{formatMoney(l.p.price, currency)}</p>
              <div className='mt-1 flex items-center gap-3'>
                <span className='inline-flex rounded border border-ink'><button onClick={() => setQty(l.id, l.variant, l.qty - 1)} aria-label='Moins' className='h-8 w-8'>−</button><span className='grid w-8 place-items-center'>{l.qty}</span><button onClick={() => setQty(l.id, l.variant, l.qty + 1)} aria-label='Plus' className='h-8 w-8'>+</button></span>
                <button onClick={() => remove(l.id, l.variant)} className='underline'>Retirer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className='self-start rounded border border-ink p-4'>
        <h2 className='mb-3 font-bold'>Récapitulatif</h2>
        <dl className='space-y-1.5 text-sm'>
          <div className='flex justify-between'><dt>Sous-total</dt><dd>{formatMoney(sub, currency)}</dd></div>
          <div className='flex justify-between'><dt>Livraison</dt><dd>{ship === 0 ? 'Offerte' : formatMoney(ship, currency)}</dd></div>
          <div className='flex justify-between border-t border-neutral-300 pt-2 text-base font-bold'><dt>Total</dt><dd>{formatMoney(sub + ship, currency)}</dd></div>
        </dl>
        <Link href='/checkout' className='mt-4 block rounded bg-ink py-3 text-center font-bold text-paper'>Passer la commande</Link>
      </aside>
    </main>
  );
}
