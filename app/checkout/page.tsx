'use client';
import Link from 'next/link';
import { useState } from 'react';
import { formatMoney, shippingFor, type Currency, type Product } from '@/lib/data';
import { useStore } from '@/components/Store';
import { useProductsByIds } from '@/components/useProducts';
import { BoxIcon } from '@/components/Icons';

type Line = { id: number; qty: number; variant: string; p: Product };

function Summary({ lines, sub, ship, currency }: { lines: Line[]; sub: number; ship: number; currency: Currency }) {
  return (
    <div className='text-sm'>
      <ul className='divide-y divide-neutral-200'>
        {lines.map((l) => (
          <li key={l.id + l.variant} className='flex items-start gap-3 py-2.5'>
            <span className='relative grid h-14 w-14 flex-none place-items-center overflow-hidden rounded border border-neutral-200 bg-soft text-neutral-400'>
              {l.p.image ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={l.p.image} alt='' className='h-full w-full object-contain' />) : <BoxIcon className='h-6 w-6' />}
              <span className='absolute -right-0 -top-0 min-w-4 rounded-bl bg-ink px-1 text-center text-[10px] font-bold text-paper'>{l.qty}</span>
            </span>
            <span className='min-w-0 flex-1 break-words [overflow-wrap:anywhere] line-clamp-2'>{l.p.name}</span>
            <span className='flex-none font-medium'>{formatMoney(l.p.price * l.qty, currency)}</span>
          </li>
        ))}
      </ul>
      <dl className='mt-3 space-y-1.5 border-t border-neutral-300 pt-3'>
        <div className='flex justify-between'><dt>Sous-total</dt><dd>{formatMoney(sub, currency)}</dd></div>
        <div className='flex justify-between'><dt>Livraison</dt><dd>{ship === 0 ? 'Offerte' : formatMoney(ship, currency)}</dd></div>
        <div className='flex justify-between border-t border-neutral-300 pt-2 text-base font-bold'><dt>Total</dt><dd>{formatMoney(sub + ship, currency)}</dd></div>
      </dl>
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, currency, setCurrency } = useStore();
  const { get, loading } = useProductsByIds(cart.map((l) => l.id));
  const [done, setDone] = useState(false);
  const lines: Line[] = cart.flatMap((l) => { const p = get(l.id); return p ? [{ ...l, p }] : []; });
  const sub = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const ship = shippingFor(currency, sub);
  const total = sub + ship;
  const haiti = currency === 'HTG';
  const inp = 'mt-1 block w-full min-w-0 rounded border border-ink bg-paper px-3 py-3 text-base';
  const lab = 'block min-w-0 text-sm font-medium';

  if (done) return (
    <main className='mx-auto max-w-xl px-4 py-16'>
      <h1 className='mb-3 text-2xl font-bold'>Aperçu de la commande</h1>
      <p className='border border-ink bg-soft p-4 text-sm'>Le paiement n’est pas encore activé : aucune commande n’a été créée et aucune donnée bancaire n’a été collectée. Cette étape sera connectée à un prestataire de paiement sécurisé.</p>
      <Link href='/' className='mt-5 inline-block rounded bg-ink px-6 py-3 font-bold text-paper'>Retour à l’accueil</Link>
    </main>
  );
  if (!lines.length) return (
    <main className='mx-auto max-w-xl px-4 py-16 text-center'>
      {loading ? <p>Chargement…</p> : <><p className='mb-3'>Votre panier est vide.</p><Link href='/products' className='underline'>Parcourir le catalogue</Link></>}
    </main>
  );

  return (
    <main className='mx-auto max-w-5xl overflow-x-hidden px-4 pb-24 pt-5 md:pb-10'>
      <h1 className='mb-4 text-2xl font-bold'>Paiement</h1>

      {/* Mobile : récapitulatif repliable en haut de page */}
      <details className='mb-5 rounded border border-gold bg-soft md:hidden'>
        <summary className='flex cursor-pointer list-none items-center justify-between gap-3 p-3 font-semibold'>
          <span>Voir ma commande ({lines.reduce((n, l) => n + l.qty, 0)})</span><span>{formatMoney(total, currency)}</span>
        </summary>
        <div className='border-t border-neutral-300 bg-paper p-3'><Summary lines={lines} sub={sub} ship={ship} currency={currency} /></div>
      </details>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_340px]'>
        <form id='checkout' onSubmit={(e) => { e.preventDefault(); setDone(true); }} className='min-w-0 space-y-5'>
          <p className='text-sm text-neutral-600'>Commande en tant qu’invité. <Link href='/login' className='underline'>Se connecter</Link></p>

          <section className='min-w-0 space-y-3 rounded border border-neutral-200 p-4'>
            <h2 className='font-bold'>1. Contact</h2>
            <label className={lab}>E-mail<input required type='email' inputMode='email' autoComplete='email' placeholder='vous@exemple.com' className={inp} /></label>
            <label className={lab}>Téléphone<input required type='tel' inputMode='tel' autoComplete='tel' placeholder={haiti ? '+509 …' : '+1 …'} className={inp} /></label>
          </section>

          <section className='min-w-0 space-y-3 rounded border border-neutral-200 p-4'>
            <h2 className='font-bold'>2. Livraison</h2>
            <label className={lab}>Pays
              <select value={haiti ? 'HT' : 'US'} onChange={(e) => setCurrency(e.target.value === 'US' ? 'USD' : 'HTG')} autoComplete='country' className={inp}>
                <option value='US'>États-Unis (USD)</option><option value='HT'>Haïti (HTG)</option>
              </select>
            </label>
            <label className={lab}>Nom complet<input required autoComplete='name' className={inp} /></label>
            <label className={lab}>Adresse<input required autoComplete='address-line1' className={inp} /></label>
            <label className={lab}>Complément d’adresse (facultatif)<input autoComplete='address-line2' className={inp} /></label>
            <div className='grid grid-cols-2 gap-3'>
              <label className={lab}>Ville<input required autoComplete='address-level2' className={inp} /></label>
              <label className={lab}>{haiti ? 'Département' : 'État'}<input required={!haiti} autoComplete='address-level1' className={inp} /></label>
            </div>
            <label className={lab}>Code postal{haiti ? ' (facultatif)' : ''}<input required={!haiti} inputMode='numeric' autoComplete='postal-code' className={inp} /></label>
            <p className='text-xs text-neutral-600'>Livraison estimée : {haiti ? 'Haïti 14 à 25 jours' : 'États-Unis 7 à 14 jours'} (provisoire).</p>
          </section>

          <section className='min-w-0 space-y-2 rounded border border-neutral-200 p-4'>
            <h2 className='font-bold'>3. Paiement</h2>
            <p className='rounded border border-gold bg-soft p-3 text-sm'>Le paiement en ligne n’est pas encore activé : votre commande ne sera pas enregistrée pour l’instant. Aucune carte n’est demandée sur ce site.</p>
          </section>

          <button className='hidden h-12 w-full rounded bg-ink font-bold text-paper md:block'>Continuer · {formatMoney(total, currency)}</button>
        </form>

        <aside className='hidden self-start rounded border border-gold p-4 md:sticky md:top-32 md:block'>
          <h2 className='mb-3 font-bold'>Votre commande</h2>
          <Summary lines={lines} sub={sub} ship={ship} currency={currency} />
          <ul className='mt-4 space-y-1.5 text-xs text-neutral-600'>
            <li>✓ Suivi de colis inclus</li><li>✓ Aucune carte stockée sur AMIRCAL</li><li>✓ Commande possible sans compte</li>
          </ul>
        </aside>
      </div>

      <div className='fixed inset-x-0 bottom-14 z-30 flex items-center gap-3 border-t border-ink bg-paper px-4 py-2 md:hidden'>
        <div className='min-w-0 flex-1'><p className='text-xs text-neutral-600'>Total {ship === 0 ? '· livraison offerte' : ''}</p><b>{formatMoney(total, currency)}</b></div>
        <button type='submit' form='checkout' className='h-11 rounded bg-ink px-5 font-bold text-paper'>Continuer</button>
      </div>
    </main>
  );
}
