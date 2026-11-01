'use client';
import Link from 'next/link';
import { useState } from 'react';
import { formatMoney, getProduct, shippingFor } from '@/lib/data';
import { useStore } from '@/components/Store';

export default function CheckoutPage() {
  const { cart, currency, setCurrency } = useStore();
  const [done, setDone] = useState(false);
  const lines = cart.flatMap((l) => { const p = getProduct(l.id); return p ? [{ ...l, p }] : []; });
  const sub = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const ship = shippingFor(currency, sub);
  const inp = 'mt-1 w-full rounded border border-ink px-3 py-3';
  if (done) return (<main className='mx-auto max-w-xl px-4 py-16'><h1 className='mb-3 text-2xl font-bold'>Aperçu de la commande</h1><p className='border border-ink bg-soft p-4 text-sm'>Le paiement n’est pas encore activé : aucune commande n’a été créée et aucune donnée bancaire n’a été collectée. Cette étape sera connectée à un prestataire de paiement sécurisé.</p><Link href='/' className='mt-5 inline-block rounded bg-ink px-6 py-3 font-bold text-paper'>Retour à l’accueil</Link></main>);
  if (!lines.length) return (<main className='mx-auto max-w-xl px-4 py-16 text-center'><p className='mb-3'>Votre panier est vide.</p><Link href='/products' className='underline'>Parcourir le catalogue</Link></main>);
  return (
    <main className='mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[1fr_320px]'>
      <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className='space-y-4'>
        <h1 className='text-2xl font-bold'>Paiement</h1>
        <p className='text-sm text-neutral-600'>Commande en tant qu’invité. <Link href='/login' className='underline'>Se connecter</Link></p>
        <label className='block text-sm font-medium'>Nom complet<input required autoComplete='name' className={inp} /></label>
        <label className='block text-sm font-medium'>E-mail<input required type='email' autoComplete='email' className={inp} /></label>
        <label className='block text-sm font-medium'>Téléphone<input required type='tel' autoComplete='tel' className={inp} /></label>
        <label className='block text-sm font-medium'>Pays
          <select value={currency === 'USD' ? 'US' : 'HT'} onChange={(e) => setCurrency(e.target.value === 'US' ? 'USD' : 'HTG')} className={inp + ' bg-paper'}><option value='US'>États-Unis (USD)</option><option value='HT'>Haïti (HTG)</option></select>
        </label>
        <label className='block text-sm font-medium'>Adresse<input required autoComplete='street-address' className={inp} /></label>
        <div className='grid grid-cols-2 gap-3'>
          <label className='block text-sm font-medium'>Ville<input required autoComplete='address-level2' className={inp} /></label>
          <label className='block text-sm font-medium'>Code postal<input autoComplete='postal-code' className={inp} /></label>
        </div>
        <fieldset className='rounded border border-neutral-300 p-3 text-sm'><legend className='px-1 font-medium'>Mode de paiement</legend><p>Paiement sécurisé par un prestataire externe : bientôt disponible. Aucune carte n’est saisie sur ce site.</p></fieldset>
        <button className='w-full rounded bg-ink py-3.5 font-bold text-paper'>Confirmer la commande</button>
      </form>
      <aside className='self-start rounded border border-ink p-4 text-sm'>
        <h2 className='mb-3 font-bold'>Votre commande</h2>
        {lines.map((l) => (<div key={l.id + l.variant} className='flex justify-between gap-2 py-1'><span className='min-w-0 truncate'>{l.qty} × {l.p.name}</span><span>{formatMoney(l.p.price * l.qty, currency)}</span></div>))}
        <div className='mt-2 flex justify-between border-t border-neutral-300 pt-2'><span>Livraison</span><span>{ship === 0 ? 'Offerte' : formatMoney(ship, currency)}</span></div>
        <div className='mt-1 flex justify-between text-base font-bold'><span>Total</span><span>{formatMoney(sub + ship, currency)}</span></div>
      </aside>
    </main>
  );
}
