'use client';
import Link from 'next/link';
import { formatMoney, type Product } from '@/lib/data';
import { LOW_STOCK, VERY_LOW_STOCK } from '@/lib/stock';
import { useStore } from './Store';
import { BoxIcon, HeartIcon } from './Icons';

export default function ProductCard({ p }: { p: Product }) {
  const { currency, add, wish, toggleWish } = useStore();
  const liked = wish.includes(p.id);
  return (
    <article className='relative flex h-full flex-col rounded border border-neutral-200 bg-paper shadow-sm'>
      <Link href={'/products/' + p.id} aria-label={p.name} className='relative grid aspect-square place-items-center overflow-hidden bg-soft text-neutral-400'>
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.name} loading='lazy' className='h-full w-full object-contain' />
        ) : (
          <BoxIcon className='h-1/3 w-1/3' />
        )}
        {p.discount > 0 && <span className='absolute left-2 top-2 rounded-sm bg-ink px-1.5 py-0.5 text-[11px] font-bold text-paper'>-{p.discount}%</span>}
      </Link>
      <button onClick={() => toggleWish(p.id)} aria-pressed={liked} aria-label='Favoris' className='absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full border border-neutral-200 bg-paper'><HeartIcon filled={liked} className='h-4 w-4' /></button>
      <div className='flex flex-1 flex-col gap-1.5 p-2.5'>
        <Link href={'/products/' + p.id} className='line-clamp-2 min-h-[2.4em] text-[13px] leading-snug'>{p.name}</Link>
        {p.rating > 0 && <div className='text-xs text-graphite'>★ {p.rating}</div>}
        <div className='text-base font-bold'>{formatMoney(p.price, currency)}{p.compareAt > 0 && <s className='ml-1.5 text-xs font-normal text-neutral-500'>{formatMoney(p.compareAt, currency)}</s>}</div>
        {p.stock === 0 ? <div className='text-xs text-neutral-500'>Rupture de stock</div>
          : p.stock <= VERY_LOW_STOCK ? <div className='text-xs font-semibold text-red-700'>Plus que {p.stock} en stock</div>
          : p.stock <= LOW_STOCK ? <div className='text-xs font-semibold text-amber-700'>Stock limité · {p.stock} restants</div>
          : <div className='flex items-center gap-1.5 text-xs font-medium text-green-700'><span aria-hidden className='h-2 w-2 rounded-full bg-green-600' />En stock</div>}
        <button disabled={!p.stock} onClick={() => add(p.id)} className='mt-auto rounded bg-ink py-2 text-[13px] font-semibold text-paper hover:bg-graphite disabled:cursor-not-allowed disabled:bg-neutral-300'>Ajouter au panier</button>
      </div>
    </article>
  );
}
