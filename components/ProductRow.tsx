import Link from 'next/link';
import type { Product } from '@/lib/data';
import ProductCard from './ProductCard';

export default function ProductRow({ title, products, band = false }: { title: string; products: Product[]; band?: boolean }) {
  return (
    <section className={band ? 'bg-soft' : ''}>
      <div className='mx-auto max-w-7xl px-4 py-6'>
        <div className='mb-3 flex items-baseline justify-between'>
          <h2 className='text-xl font-bold'>{title}</h2>
          <Link href='/products' className='text-sm underline'>Tout voir</Link>
        </div>
        <div className='flex gap-2.5 overflow-x-auto pb-2'>
          {products.map((p) => (<div key={p.id} className='w-40 flex-none md:w-48'><ProductCard p={p} /></div>))}
        </div>
      </div>
    </section>
  );
}
