import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import ProductRow from '@/components/ProductRow';
import ProductCard from '@/components/ProductCard';
import { BoxIcon } from '@/components/Icons';
import { CATEGORIES } from '@/lib/data';
import { listProducts } from '@/lib/products';

export const revalidate = 300;

export default async function Home() {
  const [latest, ...rows] = await Promise.all([
    listProducts({ per: 12 }),
    ...CATEGORIES.slice(0, 6).map((c) => listProducts({ cat: c, per: 8 })),
  ]);
  const grid = await listProducts({ per: 10, page: 2 });
  return (
    <main>
      <HeroCarousel />
      <section className='mx-auto max-w-7xl px-4 py-6'>
        <div className='flex gap-4 overflow-x-auto pb-2'>
          {CATEGORIES.map((c) => (
            <Link key={c} href={'/products?cat=' + encodeURIComponent(c)} className='w-20 flex-none text-center text-xs font-medium md:w-28 md:text-[13px]'>
              <span className='mb-2 grid aspect-square place-items-center rounded-full border border-neutral-200 bg-soft text-neutral-500'><BoxIcon className='h-1/3 w-1/3' /></span>{c}
            </Link>
          ))}
        </div>
      </section>
      {latest.items.length > 0 && <ProductRow title='Nouveautés' products={latest.items} />}
      {rows.map((r, i) => r.items.length > 0 && <ProductRow key={CATEGORIES[i]} title={CATEGORIES[i]} products={r.items} band={i % 2 === 0} />)}
      {grid.items.length > 0 && (
        <section className='mx-auto max-w-7xl px-4 py-6'>
          <h2 className='mb-3 text-xl font-bold'>À découvrir</h2>
          <div className='grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5'>{grid.items.map((p) => (<ProductCard key={p.id} p={p} />))}</div>
          <Link href='/products' className='mx-auto mt-5 block w-fit rounded border-2 border-ink px-8 py-3 font-bold hover:bg-ink hover:text-paper'>Voir tous les produits</Link>
        </section>
      )}
    </main>
  );
}
