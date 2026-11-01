'use client';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/data';
import { useStore } from '@/components/Store';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wish } = useStore();
  const items = PRODUCTS.filter((p) => wish.includes(p.id));
  return (
    <main className='mx-auto max-w-7xl px-4 py-6'>
      <h1 className='mb-4 text-2xl font-bold'>Mes favoris</h1>
      {items.length ? (<div className='grid grid-cols-2 gap-2.5 md:grid-cols-4 lg:grid-cols-5'>{items.map((p) => (<ProductCard key={p.id} p={p} />))}</div>) : (<div className='border border-dashed border-neutral-400 p-10 text-center'>Aucun favori pour le moment.<br /><Link href='/products' className='underline'>Parcourir le catalogue</Link></div>)}
    </main>
  );
}
