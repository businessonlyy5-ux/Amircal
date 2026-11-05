'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { formatMoney, getProduct, PRODUCTS, VARIANTS, type Product } from '@/lib/data';
import { useStore } from './Store';
import { BoxIcon } from './Icons';
import ProductCard from './ProductCard';

// Contenus de démonstration : description, caractéristiques et avis seront alimentés par l’import fournisseur et les vrais clients.
const PERKS = [
  { t: 'Suivi de commande', d: 'Numéro de suivi dès l’expédition' },
  { t: 'Paiement sécurisé', d: 'Aucune carte stockée sur AMIRCAL' },
  { t: 'USD et HTG', d: 'Prix affichés dans votre devise' },
  { t: 'Service client', d: 'Une équipe pour vous aider' },
];
const FAQ = [
  ['Quand vais-je recevoir ma commande ?', 'États-Unis : 7 à 14 jours. Haïti : 14 à 25 jours. Délais provisoires, confirmés avec le fournisseur.'],
  ['Comment suivre mon colis ?', 'Un numéro de suivi est ajouté à votre commande dès l’expédition, visible dans votre compte.'],
  ['Puis-je payer en gourdes (HTG) ?', 'Les prix peuvent être affichés en HTG. La devise de paiement dépend du prestataire de paiement activé.'],
  ['Que faire si j’ai un problème avec ma commande ?', 'Contactez le service client avec votre numéro de commande : nous vous répondons au plus vite.'],
];

function Stars({ n }: { n: number }) {
  return <span aria-label={n + ' sur 5'} className='tracking-tight'>{'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}</span>;
}

export default function ProductDetail({ p }: { p: Product }) {
  const router = useRouter();
  const { currency, add, cart } = useStore();
  const [img, setImg] = useState(0);
  const [color, setColor] = useState(VARIANTS.Couleur[0]);
  const [size, setSize] = useState(VARIANTS.Taille[1]);
  const [qty, setQty] = useState(1);
  const [seen, setSeen] = useState<number[]>([]);
  const variant = color + ' / ' + size;
  const out = p.stock === 0;

  const related = useMemo(() => [...PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id), ...PRODUCTS.filter((x) => x.category !== p.category)].filter((x) => x.stock > 0), [p]);
  const bundle = useMemo(() => [p, ...related.slice(0, 2)].filter((x) => x.stock > 0), [p, related]);
  const [picked, setPicked] = useState<number[]>(bundle.map((b) => b.id));
  useEffect(() => setPicked(bundle.map((b) => b.id)), [bundle]);
  const bundleTotal = bundle.filter((b) => picked.includes(b.id)).reduce((s, b) => s + b.price, 0);

  useEffect(() => {
    try {
      const prev: number[] = JSON.parse(localStorage.getItem('amircal_seen') ?? '[]');
      setSeen(prev.filter((id) => id !== p.id).slice(0, 8));
      localStorage.setItem('amircal_seen', JSON.stringify([p.id, ...prev.filter((id) => id !== p.id)].slice(0, 12)));
    } catch { /* stockage indisponible */ }
  }, [p.id]);

  const threshold = currency === 'USD' ? 50 : 100;
  const cartSub = cart.reduce((s, l) => s + (getProduct(l.id)?.price ?? 0) * l.qty, 0);
  const left = Math.max(0, threshold - cartSub);
  const chip = (on: boolean) => 'mr-1.5 mb-1.5 rounded border px-3.5 py-2 text-sm ' + (on ? 'border-ink bg-ink text-paper' : 'border-neutral-400');
  const buy = () => { add(p.id, qty, variant); };

  return (
    <main className='mx-auto max-w-7xl px-4 pb-24 pt-4 md:pb-8'>
      <div className='mb-3 border border-neutral-200 bg-soft px-3 py-2 text-xs md:text-sm'>
        {cartSub === 0 ? <>Livraison offerte dès <b>{formatMoney(threshold, currency)}</b> d’achats</> : left > 0 ? <>Plus que <b>{formatMoney(left, currency)}</b> pour la livraison offerte</> : <b>Livraison offerte sur votre panier</b>}
        <div className='mt-1.5 h-1.5 w-full bg-neutral-300'><div className='h-full bg-ink transition-all' style={{ width: Math.min(100, (cartSub / threshold) * 100) + '%' }} /></div>
      </div>
      <p className='mb-3 text-xs text-neutral-600'><Link href='/products' className='underline'>Catalogue</Link> / <Link href={'/products?cat=' + encodeURIComponent(p.category)} className='underline'>{p.category}</Link> / {p.name}</p>

      <div className='grid gap-6 md:grid-cols-2 md:gap-10'>
        <div>
          <div className='relative grid aspect-square place-items-center border border-neutral-200 bg-soft text-neutral-400'>
            <BoxIcon className='h-1/3 w-1/3' />
            {p.discount > 0 && <span className='absolute left-3 top-3 rounded-sm bg-ink px-2 py-1 text-xs font-bold text-paper'>-{p.discount}%</span>}
          </div>
          <div className='mt-2 flex gap-2 overflow-x-auto'>{[0, 1, 2, 3].map((i) => (<button key={i} onClick={() => setImg(i)} aria-label={'Image ' + (i + 1)} aria-current={img === i} className={'grid h-16 w-16 flex-none place-items-center bg-soft text-xs ' + (img === i ? 'border-2 border-ink' : 'border border-neutral-200')}>{i + 1}</button>))}</div>
        </div>

        <div className='md:sticky md:top-32 md:self-start'>
          <p className='text-xs font-semibold uppercase tracking-widest text-neutral-500'>{p.category}</p>
          <h1 className='mb-2 text-2xl font-extrabold leading-tight md:text-3xl'>{p.name}</h1>
          <p className='text-sm'>{p.rating ? <><Stars n={p.rating} /> <span className='text-graphite'>{p.rating} · 3 avis</span></> : <span className='text-graphite'>Aucun avis pour le moment</span>}</p>
          <p className='mt-3 text-3xl font-extrabold'>{formatMoney(p.price, currency)}{p.compareAt > 0 && <s className='ml-2 text-base font-normal text-neutral-500'>{formatMoney(p.compareAt, currency)}</s>}</p>
          {p.compareAt > 0 && <p className='text-sm font-semibold'>Vous économisez {formatMoney(p.compareAt - p.price, currency)}</p>}

          <div className='mt-4'><b className='mb-1.5 block text-sm'>Couleur : {color}</b>{VARIANTS.Couleur.map((c) => (<button key={c} onClick={() => setColor(c)} aria-pressed={c === color} className={chip(c === color)}>{c}</button>))}</div>
          <div className='mt-2'><b className='mb-1.5 block text-sm'>Taille : {size}</b>{VARIANTS.Taille.map((s) => (<button key={s} onClick={() => setSize(s)} aria-pressed={s === size} className={chip(s === size)}>{s}</button>))}</div>

          <p className='mt-3 flex items-center gap-2 text-sm'><span className={'h-2.5 w-2.5 rounded-full ' + (out ? 'bg-neutral-400' : 'bg-ink')} />{out ? 'Rupture de stock' : p.stock < 10 ? 'Stock limité : plus que ' + p.stock + ' disponibles' : 'En stock, prêt à expédier'}</p>

          <div className='mt-4 flex flex-wrap items-center gap-3'>
            <span className='inline-flex rounded border border-ink'>
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label='Moins' className='h-12 w-11 text-lg'>−</button>
              <span className='grid w-10 place-items-center'>{qty}</span>
              <button onClick={() => setQty(Math.min(10, qty + 1))} aria-label='Plus' className='h-12 w-11 text-lg'>+</button>
            </span>
            <button disabled={out} onClick={buy} className='h-12 min-w-40 flex-1 rounded bg-ink font-bold text-paper hover:bg-graphite disabled:bg-neutral-300'>Ajouter au panier · {formatMoney(p.price * qty, currency)}</button>
          </div>
          <button disabled={out} onClick={() => { buy(); router.push('/checkout'); }} className='mt-2.5 h-12 w-full rounded border-2 border-ink font-bold disabled:opacity-40'>Acheter maintenant</button>

          <ul className='mt-5 grid grid-cols-2 gap-2'>
            {PERKS.map((x) => (<li key={x.t} className='rounded border border-neutral-200 p-2.5 text-xs'><b className='block text-[13px]'>{x.t}</b>{x.d}</li>))}
          </ul>
          <p className='mt-3 text-xs text-neutral-600'>Livraison estimée : États-Unis 7 à 14 jours · Haïti 14 à 25 jours (provisoire).</p>
        </div>
      </div>

      {bundle.length > 1 && (
        <section className='mt-10 rounded border border-ink p-4'>
          <h2 className='mb-3 text-xl font-bold'>Souvent achetés ensemble</h2>
          <div className='flex gap-2 overflow-x-auto pb-2'>
            {bundle.map((b, k) => (
              <label key={b.id} className='flex w-36 flex-none cursor-pointer flex-col gap-1 text-xs'>
                <span className='relative grid aspect-square place-items-center bg-soft text-neutral-400'><BoxIcon className='h-1/3 w-1/3' /><input type='checkbox' className='absolute left-2 top-2 h-5 w-5 accent-black' checked={picked.includes(b.id)} disabled={k === 0} onChange={(e) => setPicked(e.target.checked ? [...picked, b.id] : picked.filter((x) => x !== b.id))} aria-label={b.name} /></span>
                <span className='line-clamp-2'>{k === 0 ? 'Cet article : ' : ''}{b.name}</span>
                <b>{formatMoney(b.price, currency)}</b>
              </label>
            ))}
          </div>
          <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm'>Total pour {picked.length} article{picked.length > 1 ? 's' : ''} : <b className='text-lg'>{formatMoney(bundleTotal, currency)}</b></p>
            <button onClick={() => bundle.filter((b) => picked.includes(b.id)).forEach((b) => add(b.id, 1, k0(b, p, variant)))} className='rounded bg-ink px-5 py-3 font-bold text-paper hover:bg-graphite'>Ajouter la sélection au panier</button>
          </div>
        </section>
      )}

      <section className='mt-10 grid gap-6 md:grid-cols-2'>
        <div>
          <h2 className='mb-2 text-xl font-bold'>Pourquoi vous allez l’adorer</h2>
          <ul className='space-y-2 text-sm'>
            {['Commandez en toute simplicité, en USD ou en HTG', 'Suivi de colis disponible dans votre compte', 'Paiement sécurisé par un prestataire externe', 'Choisissez votre couleur et votre taille avant d’ajouter au panier'].map((t) => (<li key={t} className='flex gap-2'><span aria-hidden>✓</span>{t}</li>))}
          </ul>
        </div>
        <div className='rounded border border-neutral-200 p-4 text-sm leading-relaxed'><b>Description</b><br />Description de démonstration. La fiche réelle (texte, caractéristiques, photos) sera importée du fournisseur après connexion de l’API.</div>
      </section>

      <section className='mt-10'>
        <h2 className='mb-3 text-xl font-bold'>Questions fréquentes</h2>
        <div className='divide-y divide-neutral-200 border-y border-neutral-200'>
          {FAQ.map(([q, a]) => (<details key={q} className='group py-3'><summary className='flex cursor-pointer list-none items-center justify-between font-medium'>{q}<span className='text-xl group-open:rotate-45'>+</span></summary><p className='mt-2 text-sm text-graphite'>{a}</p></details>))}
        </div>
      </section>

      <section className='mt-10'>
        <h2 className='mb-3 text-xl font-bold'>Avis clients</h2>
        {p.rating ? (
          <div className='grid gap-6 md:grid-cols-[220px_1fr]'>
            <div><p className='text-4xl font-extrabold'>{p.rating}</p><Stars n={p.rating} /><p className='text-xs text-neutral-600'>Avis de démonstration</p></div>
            <div>{['Très bon produit, conforme.', 'Livraison correcte.', 'Bon rapport qualité-prix.'].map((t, i) => (<div key={t} className='border-b border-neutral-200 py-2.5 text-sm'><Stars n={5 - (i % 2)} /> · Client {i + 1}<br />{t}</div>))}</div>
          </div>
        ) : <div className='border border-dashed border-neutral-400 p-8 text-center'>Soyez le premier à donner votre avis.</div>}
      </section>

      <section className='mt-10'>
        <h2 className='mb-3 text-xl font-bold'>Vous aimerez aussi</h2>
        <div className='flex gap-2.5 overflow-x-auto pb-2'>{related.slice(0, 8).map((r) => (<div key={r.id} className='w-40 flex-none'><ProductCard p={r} /></div>))}</div>
      </section>

      {seen.length > 0 && (
        <section className='mt-10'>
          <h2 className='mb-3 text-xl font-bold'>Consultés récemment</h2>
          <div className='flex gap-2.5 overflow-x-auto pb-2'>{seen.map((id) => getProduct(id)).filter((x): x is Product => !!x).map((r) => (<div key={r.id} className='w-40 flex-none'><ProductCard p={r} /></div>))}</div>
        </section>
      )}

      <div className='fixed inset-x-0 bottom-14 z-30 flex items-center gap-3 border-t border-ink bg-paper px-4 py-2 pb-2 md:hidden'>
        <div className='min-w-0 flex-1'><p className='truncate text-xs'>{p.name}</p><b>{formatMoney(p.price * qty, currency)}</b></div>
        <button disabled={out} onClick={buy} className='h-11 rounded bg-ink px-5 font-bold text-paper disabled:bg-neutral-300'>{out ? 'Indisponible' : 'Ajouter'}</button>
      </div>
    </main>
  );
}

// Variante appliquée aux articles du lot : celle choisie pour l’article principal, défaut pour les autres.
function k0(b: Product, main: Product, variant: string) {
  return b.id === main.id ? variant : 'Noir / M';
}
