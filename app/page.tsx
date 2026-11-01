import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import ProductRow from '@/components/ProductRow';
import ProductCard from '@/components/ProductCard';
import { BoxIcon } from '@/components/Icons';
import { CATEGORIES, PRODUCTS } from '@/lib/data';

const slice = (a: number, n = 8) => PRODUCTS.filter((p) => p.stock > 0).slice(a, a + n);
const COLLECTIONS = ['Cuisine essentielle', 'Bureau à domicile', 'Sport & fitness', 'Cadeaux enfants'];

export default function Home() {
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
      <ProductRow title='Meilleures ventes' products={slice(0)} />
      <ProductRow title='Offres du jour' products={PRODUCTS.filter((p) => p.discount > 0 && p.stock > 0).slice(0, 8)} band />
      <ProductRow title='Nouveautés' products={slice(8)} />
      <ProductRow title='Tendances' products={slice(2)} band />
      <section className='mx-auto max-w-7xl px-4 py-6'>
        <h2 className='mb-3 text-xl font-bold'>Collections populaires</h2>
        <div className='grid grid-cols-2 gap-2.5 md:grid-cols-4'>
          {COLLECTIONS.map((c, i) => (<Link key={c} href='/products' className={'flex min-h-28 items-end rounded p-4 text-lg font-bold ' + (i % 2 ? 'border border-neutral-200 bg-soft' : 'bg-ink text-paper')}>{c}</Link>))}
        </div>
      </section>
      <ProductRow title='Recommandés pour vous' products={slice(6)} band />
      <section className='mx-auto max-w-7xl px-4 py-6'>
        <h2 className='mb-3 text-xl font-bold'>Tous les produits</h2>
        <div className='grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5'>{PRODUCTS.slice(0, 10).map((p) => (<ProductCard key={p.id} p={p} />))}</div>
        <Link href='/products' className='mx-auto mt-5 block w-fit rounded border-2 border-ink px-8 py-3 font-bold hover:bg-ink hover:text-paper'>Voir tous les produits</Link>
      </section>
    </main>
  );
}
