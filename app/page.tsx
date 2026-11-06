import Link from 'next/link';
import HeroCarousel, { type Slide } from '@/components/HeroCarousel';
import ProductRow from '@/components/ProductRow';
import ProductCard from '@/components/ProductCard';
import CatName from '@/components/CatName';
import { BoxIcon } from '@/components/Icons';
import { getCategories, type Cat } from '@/lib/categories';
import { getCollections } from '@/lib/collections';
import { heroSlides } from '@/lib/hero';
import { listProducts } from '@/lib/products';

export const revalidate = 300;

export default async function Home() {
  const [cats, collections] = await Promise.all([getCategories(), getCollections()]);
  const rowCats = cats.slice(0, 6);
  const heroCats: Cat[] = ['maison-cuisine', 'electronique', 'beaute-soins'].flatMap((s) => cats.filter((c) => c.slug === s));
  const heroPick = heroCats.length ? heroCats : cats.slice(0, 3);
  const custom = heroSlides(); // bannières déposées dans public/hero/
  const [latest, grid, heroLists, ...rows] = await Promise.all([
    listProducts({ per: 12 }),
    listProducts({ per: 10, page: 2 }),
    custom.length ? Promise.resolve([]) : Promise.all(heroPick.map((c) => listProducts({ cat: c.slug, per: 3 }))),
    ...rowCats.map((c) => listProducts({ cat: c.slug, per: 8 })),
  ]);
  const imgs = (items: { image?: string }[]) => items.map((p) => p.image).filter((u): u is string => !!u);
  const slides: Slide[] = custom.length ? custom : [
    ...heroPick.map((c, i) => ({ cat: c, images: imgs(heroLists[i].items) })),
    { images: imgs(latest.items).slice(0, 3) },
  ];
  return (
    <main>
      <HeroCarousel slides={slides} />
      <section className='mx-auto max-w-7xl px-4 py-6'>
        <div className='flex gap-4 overflow-x-auto pb-2'>
          {cats.map((c) => (
            <Link key={c.slug} href={'/products?cat=' + c.slug} className='w-20 flex-none text-center text-xs font-medium md:w-28 md:text-[13px]'>
              <span className='mb-2 grid aspect-square place-items-center overflow-hidden rounded-full border border-neutral-200 bg-white text-neutral-500'>
                {c.image ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={c.image} alt='' loading='lazy' className='h-full w-full object-cover' />) : <BoxIcon className='h-1/3 w-1/3' />}
              </span>
              <CatName c={c} />
            </Link>
          ))}
        </div>
      </section>

      {collections.length > 0 && (
        <section className='bg-soft'>
          <div className='mx-auto max-w-7xl px-4 py-6'>
            <h2 className='mb-3 text-xl font-bold'>Collections</h2>
            <div className='grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4'>
              {collections.slice(0, 4).map((c) => (
                <Link key={c.slug} href={'/products?col=' + c.slug} className='group overflow-hidden rounded border border-neutral-200 bg-paper shadow-sm'>
                  <span className='grid aspect-[4/3] place-items-center overflow-hidden bg-white'>
                    {c.image ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={c.image} alt='' loading='lazy' className='h-full w-full object-contain p-3 transition-transform group-hover:scale-105' />) : <BoxIcon className='h-1/4 w-1/4 text-neutral-400' />}
                  </span>
                  <span className='block border-t-2 border-gold bg-ink px-3 py-2.5 text-paper'>
                    <span className='block text-[10px] font-semibold uppercase tracking-[.16em] text-gold'>Collection</span>
                    <span className='block font-bold leading-tight'><CatName c={c} /></span>
                    {c.description && <span className='mt-0.5 block text-xs text-neutral-300'>{c.description}</span>}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {latest.items.length > 0 && <ProductRow title='Nouveautés' products={latest.items} />}
      {rows.map((r, i) => r.items.length > 0 && <ProductRow key={rowCats[i].slug} title={<CatName c={rowCats[i]} />} products={r.items} band={i % 2 === 1} href={'/products?cat=' + rowCats[i].slug} />)}
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
