import Link from 'next/link';
import HeroCarousel, { type HeroCopy, type Slide } from '@/components/HeroCarousel';
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
// focus = point de cadrage de la photo (x y).
// Maison : photo dédiée (salle à manger lumineuse), cadrée sur les cadres, le pendentif et la plante.
const PHOTO_HOME = '/hero/file_0000000021b881f5b9f10bc5a7af53e7.png';
const PHOTO_MAISON = '/hero/collov-home-design-Pf-GjKfYGO4-unsplash.jpg';
const HERO_PHOTOS: Record<string, { src: string; focus: string }> = {
  maison: { src: PHOTO_MAISON, focus: '50% 30%' },
  beaute: { src: '/hero/file_00000000cb1881f5aeace90b58ec17c0.png', focus: '62% 40%' },
  sports: { src: '/hero/file_0000000070e081f595b1fb4b7bf213d1.png', focus: '50% 40%' },
};
const HERO_SHIP = { src: PHOTO_HOME, focus: '68% 40%' }; // bannière générale (livraison)

// Textes des bannières (FR / EN) : un titre, une description et un bouton propres à chaque univers.
// Les descriptions ne reprennent que ce que le catalogue propose réellement.
const HERO_COPY: Record<string, { fr: HeroCopy; en: HeroCopy }> = {
  maison: {
    fr: { eyebrow: 'Maison', title: 'Une maison qui vous ressemble', desc: 'Décoration, literie, salle de bain et rangement : des pièces choisies pour apporter chaleur et confort à chaque pièce.', cta: 'Explorer la collection Maison' },
    en: { eyebrow: 'Home', title: 'A home that feels like you', desc: 'Decor, bedding, bath and storage: pieces chosen to bring warmth and comfort to every room.', cta: 'Explore the Home collection' },
  },
  sports: {
    fr: { eyebrow: 'Sports', title: 'Bougez à votre rythme', desc: 'Fitness, course, vélo et sports d’équipe : l’équipement pour vous entraîner chez vous, en salle ou dehors.', cta: 'Découvrir l’univers Sports' },
    en: { eyebrow: 'Sports', title: 'Move at your own pace', desc: 'Fitness, running, cycling and team sports: the gear to train at home, in the gym or outdoors.', cta: 'Discover Sports' },
  },
  beaute: {
    fr: { eyebrow: 'Beauté', title: 'Votre routine beauté, simplifiée', desc: 'Maquillage, accessoires et soins pour les cheveux : une sélection pour prendre soin de vous au quotidien.', cta: 'Découvrir la sélection Beauté' },
    en: { eyebrow: 'Beauty', title: 'Your beauty routine, simplified', desc: 'Makeup, accessories and hair care: a selection to look after yourself every day.', cta: 'Discover the Beauty selection' },
  },
  ship: {
    fr: { eyebrow: 'Livraison', title: 'Livraison offerte, suivi inclus', desc: 'Commandez en USD ou en HTG et suivez votre colis jusqu’à la livraison, aux États-Unis comme en Haïti.', cta: 'Voir tous les produits' },
    en: { eyebrow: 'Shipping', title: 'Free shipping, tracking included', desc: 'Order in USD or HTG and follow your package all the way to delivery, in the United States and in Haiti.', cta: 'Browse all products' },
  },
};

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
    ...heroPick.map((c, i) => ({ cat: c, images: imgs(heroLists[i].items), photo: HERO_PHOTOS[c.slug]?.src, focus: HERO_PHOTOS[c.slug]?.focus, copy: HERO_COPY[c.slug] })),
    { images: imgs(hotItems).slice(0, 3), photo: HERO_SHIP.src, focus: HERO_SHIP.focus, copy: HERO_COPY.ship },
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
