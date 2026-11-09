import Link from 'next/link';
import HeroCarousel, { type Slide } from '@/components/HeroCarousel';
import ProductRow from '@/components/ProductRow';
import ProductCard from '@/components/ProductCard';
import CatName from '@/components/CatName';
import { BoxIcon } from '@/components/Icons';
import { getCategories, type Cat } from '@/lib/categories';
import { getCollections } from '@/lib/collections';
import { heroSlides } from '@/lib/hero';
import { categoryPhotos, collectionPhotos } from '@/lib/local-images';
import { listProducts, trending } from '@/lib/products';

export const revalidate = 300;

// Photos d’ambiance des bannières (déposées dans public/hero/) : elles couvrent toute la bannière, le texte se pose dessus.
// Les textes des bannières ne changent pas. focus = point de cadrage de la photo (x y).
// Maison réutilise la photo du salon, cadrée sur le décor (à remplacer par une photo dédiée).
const PHOTO_HOME = '/hero/file_0000000021b881f5b9f10bc5a7af53e7.png';
const HERO_PHOTOS: Record<string, { src: string; focus: string }> = {
  maison: { src: PHOTO_HOME, focus: '15% 50%' },
  beaute: { src: '/hero/file_00000000cb1881f5aeace90b58ec17c0.png', focus: '62% 40%' },
  sports: { src: '/hero/file_0000000070e081f595b1fb4b7bf213d1.png', focus: '50% 40%' },
};
const HERO_SHIP = { src: PHOTO_HOME, focus: '68% 40%' }; // bannière générale (livraison)

export default async function Home() {
  const [cats, collections] = await Promise.all([getCategories(), getCollections()]);
  // Rangées de catégories de l’accueil : les 6 premières catégories, avec Sports à la place d’Électronique.
  const sports = cats.find((c) => c.slug === 'sports');
  const rowCats = cats.slice(0, 6).map((c) => (c.slug === 'electronique' && sports ? sports : c));
  const heroCats: Cat[] = ['maison', 'sports', 'beaute'].flatMap((s) => cats.filter((c) => c.slug === s));
  const heroPick = heroCats.length ? heroCats : cats.slice(0, 3);
  const custom = heroSlides(); // bannières pleine largeur déposées dans public/hero/ (hero-1.jpg…)
  const catPhotos = categoryPhotos(); // photos déposées dans public/categories/
  const colPhotos = collectionPhotos(); // photos déposées dans public/collections/
  // Tendances et « À découvrir » : sélection faite à la main (rangs 1 à 12, puis 13 à 22). Chaque rangée de catégorie suit l’ordre de la sélection de la catégorie.
  const [hot, discover, heroLists, ...rows] = await Promise.all([
    trending(1, 12),
    trending(13, 22),
    custom.length ? Promise.resolve([]) : Promise.all(heroPick.map((c) => listProducts({ cat: c.slug, per: 3 }))),
    ...rowCats.map((c) => listProducts({ cat: c.slug, per: 8 })),
  ]);
  const hotItems = hot.length ? hot : (await listProducts({ per: 12 })).items; // repli si aucune sélection n’est définie
  const gridItems = discover.length ? discover : (await listProducts({ per: 10, page: 2 })).items;
  const imgs = (items: { image?: string }[]) => items.map((p) => p.image).filter((u): u is string => !!u);
  const slides: Slide[] = custom.length ? custom : [
    ...heroPick.map((c, i) => ({ cat: c, images: imgs(heroLists[i].items), photo: HERO_PHOTOS[c.slug]?.src, focus: HERO_PHOTOS[c.slug]?.focus })),
    { images: imgs(hotItems).slice(0, 3), photo: HERO_SHIP.src, focus: HERO_SHIP.focus },
  ];
  return (
    <main>
      <HeroCarousel slides={slides} />
      <section className='mx-auto max-w-7xl px-4 py-6'>
        <div className='flex gap-4 overflow-x-auto pb-2'>
          {cats.map((c) => {
            // Photo déposée = affichée telle quelle ; sinon photo produit : le fond blanc se fond dans le beige (mix-blend-multiply).
            const photo = catPhotos[c.slug];
            const src = photo ?? c.image;
            return (
              <Link key={c.slug} href={'/products?cat=' + c.slug} className='w-20 flex-none text-center text-xs font-medium md:w-28 md:text-[13px]'>
                <span className='mb-2 grid aspect-square place-items-center overflow-hidden rounded-full border border-neutral-200 bg-[#f3ecdf] text-neutral-500'>
                  {src ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt='' loading='lazy' className={photo ? 'h-full w-full object-cover' : 'h-full w-full object-contain p-2 mix-blend-multiply'} />) : <BoxIcon className='h-1/3 w-1/3' />}
                </span>
                <CatName c={c} />
              </Link>
            );
          })}
        </div>
      </section>

      {hotItems.length > 0 && <ProductRow title='Tendances' products={hotItems} />}

      {collections.length > 0 && (
        <section className='mx-auto max-w-7xl px-4 py-6'>
          <h2 className='mb-3 text-xl font-bold'>Collections</h2>
          <div className='flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible'>
            {collections.slice(0, 4).map((c) => {
              const photo = colPhotos[c.slug];
              const src = photo ?? c.image;
              return (
                <Link key={c.slug} href={'/products?col=' + c.slug} className='group w-40 flex-none md:w-auto'>
                  <span className='grid aspect-square place-items-center overflow-hidden rounded-lg border border-neutral-200 bg-[#f3ecdf]'>
                    {src ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt='' loading='lazy' className={'h-full w-full transition-transform group-hover:scale-105 ' + (photo ? 'object-cover' : 'object-contain p-3 mix-blend-multiply')} />) : <BoxIcon className='h-1/4 w-1/4 text-neutral-400' />}
                  </span>
                  <span className='mt-2 block font-bold leading-tight'><CatName c={c} /></span>
                  {c.description && <span className='block text-xs text-graphite'>{c.description}</span>}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {rows.map((r, i) => r.items.length > 0 && <ProductRow key={rowCats[i].slug} title={<CatName c={rowCats[i]} />} products={r.items} band={i % 2 === 1} href={'/products?cat=' + rowCats[i].slug} />)}
      {gridItems.length > 0 && (
        <section className='mx-auto max-w-7xl px-4 py-6'>
          <h2 className='mb-3 text-xl font-bold'>À découvrir</h2>
          <div className='grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5'>{gridItems.map((p) => (<ProductCard key={p.id} p={p} />))}</div>
          <Link href='/products' className='mx-auto mt-5 block w-fit rounded border-2 border-ink px-8 py-3 font-bold hover:bg-ink hover:text-paper'>Voir tous les produits</Link>
        </section>
      )}
    </main>
  );
}
