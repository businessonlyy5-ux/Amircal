'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatMoney, PRODUCTS, VARIANTS, type Product } from '@/lib/data';
import { useStore } from './Store';
import { BoxIcon } from './Icons';
import ProductCard from './ProductCard';

export default function ProductDetail({ p }: { p: Product }) {
  const router = useRouter();
  const { currency, add } = useStore();
  const [img, setImg] = useState(0);
  const [color, setColor] = useState(VARIANTS.Couleur[0]);
  const [size, setSize] = useState(VARIANTS.Taille[1]);
  const [qty, setQty] = useState(1);
  const variant = color + ' / ' + size;
  const related = [...PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id), ...PRODUCTS.filter((x) => x.category !== p.category)].slice(0, 8);
  const chip = (on: boolean) => 'mr-1.5 mb-1.5 rounded border px-3.5 py-2 ' + (on ? 'border-ink bg-ink text-paper' : 'border-neutral-400');
  return (
    <main className='mx-auto max-w-7xl px-4 py-4'>
      <p className='mb-3 text-xs text-neutral-600'><Link href='/products' className='underline'>Catalogue</Link> / {p.category} / {p.name}</p>
      <div className='grid gap-6 md:grid-cols-2 md:gap-10'>
        <div>
          <div className='grid aspect-square place-items-center border border-neutral-200 bg-soft text-neutral-400'><BoxIcon className='h-1/3 w-1/3' /></div>
          <div className='mt-2 flex gap-2'>{[0, 1, 2, 3].map((i) => (<button key={i} onClick={() => setImg(i)} aria-label={'Image ' + (i + 1)} aria-current={img === i} className={'grid h-16 w-16 place-items-center bg-soft text-xs ' + (img === i ? 'border-2 border-ink' : 'border border-neutral-200')}>{i + 1}</button>))}</div>
        </div>
        <div>
          <h1 className='mb-2 text-2xl font-bold leading-tight'>{p.name}</h1>
          <p className='text-sm text-graphite'>{p.rating ? '★ ' + p.rating + ' · 3 avis' : 'Aucun avis pour le moment'}</p>
          <p className='my-3 text-3xl font-bold'>{formatMoney(p.price, currency)}{p.compareAt > 0 && <s className='ml-2 text-base font-normal text-neutral-500'>{formatMoney(p.compareAt, currency)}</s>}</p>
          {p.discount > 0 && <span className='rounded-sm bg-ink px-2 py-1 text-xs font-bold text-paper'>-{p.discount}%</span>}
          <div className='mt-4'><b className='mb-1.5 block'>Couleur</b>{VARIANTS.Couleur.map((c) => (<button key={c} onClick={() => setColor(c)} aria-pressed={c === color} className={chip(c === color)}>{c}</button>))}</div>
          <div className='mt-2'><b className='mb-1.5 block'>Taille</b>{VARIANTS.Taille.map((s) => (<button key={s} onClick={() => setSize(s)} aria-pressed={s === size} className={chip(s === size)}>{s}</button>))}</div>
          <p className='mt-3 text-sm'>{p.stock === 0 ? 'Rupture de stock' : p.stock < 10 ? 'Plus que ' + p.stock + ' en stock' : 'En stock'}</p>
          <div className='mt-3'><b className='mb-1.5 block'>Quantité</b>
            <span className='inline-flex rounded border border-ink'>
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label='Moins' className='h-10 w-10 text-lg'>−</button>
              <span className='grid w-10 place-items-center'>{qty}</span>
              <button onClick={() => setQty(Math.min(10, qty + 1))} aria-label='Plus' className='h-10 w-10 text-lg'>+</button>
            </span>
          </div>
          <div className='my-4 flex flex-wrap gap-2.5'>
            <button disabled={!p.stock} onClick={() => add(p.id, qty, variant)} className='min-w-36 flex-1 rounded bg-ink py-3.5 font-semibold text-paper hover:bg-graphite disabled:bg-neutral-300'>Ajouter au panier</button>
            <button disabled={!p.stock} onClick={() => { add(p.id, qty, variant); router.push('/checkout'); }} className='min-w-36 flex-1 rounded border-2 border-ink py-3.5 font-bold disabled:opacity-40'>Acheter maintenant</button>
          </div>
          <div className='mb-2.5 rounded border border-neutral-200 p-3 text-sm leading-relaxed'><b>Livraison estimée</b><br />États-Unis : 7 à 14 jours · Haïti : 14 à 25 jours<br /><span className='text-neutral-600'>Délais provisoires, à confirmer avec le fournisseur.</span></div>
          <div className='rounded border border-neutral-200 p-3 text-sm leading-relaxed'><b>Description</b><br />Description de démonstration. La fiche réelle sera importée du fournisseur après connexion de l’API.</div>
        </div>
      </div>
      <h2 className='mb-3 mt-8 text-xl font-bold'>Avis clients</h2>
      {p.rating ? ['Très bon produit, conforme.', 'Livraison correcte.', 'Bon rapport qualité-prix.'].map((t, i) => (<div key={t} className='border-b border-neutral-200 py-2.5 text-sm'>★ {5 - (i % 2)} · Client {i + 1}<br />{t}</div>)) : <div className='border border-dashed border-neutral-400 p-8 text-center'>Soyez le premier à donner votre avis.</div>}
      <h2 className='mb-3 mt-8 text-xl font-bold'>Produits similaires</h2>
      <div className='flex gap-2.5 overflow-x-auto pb-2'>{related.map((r) => (<div key={r.id} className='w-40 flex-none'><ProductCard p={r} /></div>))}</div>
    </main>
  );
}
