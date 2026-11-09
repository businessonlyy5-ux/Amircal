'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { Cat } from '@/lib/categories';
import { formatMoney } from '@/lib/data';
import { tr } from '@/lib/i18n';
import { useStore } from './Store';
import CatName from './CatName';
import { BoxIcon } from './Icons';

export type Banner = { desktop: string; mobile?: string; href: string; alt: string };
// Texte d’une bannière, en français et en anglais : eyebrow = petit repère au-dessus du titre, cta = libellé du bouton.
export type HeroCopy = { eyebrow?: string; title: string; desc: string; cta: string };
// photo : photo d’ambiance (public/hero/) affichée en pleine bannière, atténuée par un voile sombre pour que le texte reste lisible ;
// focus : point de cadrage de la photo (ex. « 60% 40% ») ; copy : textes propres à la bannière (sinon textes génériques).
export type Slide = { cat?: Cat; images: string[]; banner?: Banner; photo?: string; focus?: string; copy?: { fr: HeroCopy; en: HeroCopy } };

// Si des bannières pleine largeur sont déposées dans public/hero/ (hero-1.jpg…), elles s’affichent seules.
// Sinon : bannières avec texte ; avec photo, le texte se pose sur la photo ; sans photo, vignettes produits du catalogue.
export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const { lang, currency } = useStore();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  useEffect(() => {
    if (paused || n < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [paused, n]);
  if (n === 0) return null;
  const go = (k: number) => setI((k + n) % n);
  const dark = !!slides[i].banner || !!slides[i].photo || i % 2 === 1;
  const keyOf = (s: Slide) => s.banner?.desktop ?? s.cat?.slug ?? 'ship';
  const en = lang === 'en';
  const txt = (s: Slide): { eyebrow?: string; title: ReactNode; desc: string; cta: string } => {
    const c = s.copy?.[en ? 'en' : 'fr'];
    return {
      eyebrow: c?.eyebrow,
      title: c?.title ?? (s.cat ? <CatName c={s.cat} /> : tr(lang, 'hero.ship.title')),
      desc: c?.desc ?? (s.cat ? tr(lang, 'hero.desc') : tr(lang, 'hero.ship.desc')),
      cta: c?.cta ?? (s.cat ? tr(lang, 'hero.cta') : tr(lang, 'hero.ship.cta')),
    };
  };
  // Ligne de réassurance sous le bouton (mêmes informations que le bandeau du site).
  const trust = (en ? 'Free shipping over ' : 'Livraison offerte dès ') + formatMoney(currency === 'USD' ? 50 : 100, currency) + (en ? ' · Tracking included' : ' · Suivi de colis inclus');
  return (
    <section aria-roledescription='carousel' aria-label='Promotions' onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className='relative overflow-hidden'>
      <div className='flex transition-transform duration-500 motion-reduce:transition-none' style={{ transform: 'translateX(-' + i * 100 + '%)' }}>
        {slides.map((s, k) => {
          const t = txt(s);
          const href = s.cat ? '/products?cat=' + s.cat.slug : '/products';
          if (s.banner) {
            return (
              <div key={keyOf(s)} aria-hidden={k !== i} className='w-full flex-none'>
                <Link href={s.banner.href} tabIndex={k === i ? 0 : -1} aria-label={s.banner.alt} className='block'>
                  <picture>
                    <source media='(min-width: 768px)' srcSet={s.banner.desktop} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.banner.mobile ?? s.banner.desktop} alt={s.banner.alt} loading={k === 0 ? 'eager' : 'lazy'} className='aspect-[3/2] w-full object-cover md:aspect-[3/1]' />
                  </picture>
                </Link>
              </div>
            );
          }
          if (s.photo) {
            // Photo en fond sur toute la bannière, voile sombre dégradé (plus foncé côté texte), texte clair par-dessus.
            return (
              <div key={keyOf(s)} aria-hidden={k !== i} className='relative isolate flex min-h-[270px] w-full flex-none items-center overflow-hidden bg-ink text-paper md:min-h-[400px]'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.photo} alt='' loading={k === 0 ? 'eager' : 'lazy'} className='absolute inset-0 -z-20 h-full w-full object-cover opacity-90' style={{ objectPosition: s.focus ?? 'center' }} />
                <div aria-hidden className='absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/50 to-black/20 md:from-black/70 md:via-black/40 md:to-black/10' />
                <div className='relative flex max-w-xl flex-col gap-2.5 px-12 py-10 pb-14 md:gap-3 md:py-12 md:pl-16 md:pr-6'>
                  {t.eyebrow && <span className='text-xs font-semibold uppercase tracking-[.2em] text-gold md:text-sm'>{t.eyebrow}</span>}
                  <h2 className='text-3xl font-extrabold leading-tight tracking-tight drop-shadow md:text-5xl'>{t.title}</h2>
                  <p className='max-w-md text-sm opacity-95 drop-shadow md:text-base'>{t.desc}</p>
                  <Link href={href} tabIndex={k === i ? 0 : -1} className='mt-1 inline-flex items-center gap-2 self-start rounded border border-paper bg-paper px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-transparent hover:text-paper md:px-6 md:py-3 md:text-base'>{t.cta}<span aria-hidden>→</span></Link>
                  <p className='text-xs opacity-80 md:text-sm'>{trust}</p>
                </div>
              </div>
            );
          }
          return (
            <div key={keyOf(s)} aria-hidden={k !== i} className={'grid min-h-[250px] w-full flex-none grid-cols-[1.15fr_1fr] md:min-h-[360px] md:grid-cols-2 ' + (k % 2 ? 'bg-ink text-paper' : 'bg-soft text-ink')}>
              <div className='flex flex-col justify-center gap-2.5 py-8 pl-12 pr-2 pb-12 md:max-w-xl md:gap-3 md:pl-14 md:pr-6 md:pb-8'>
                {t.eyebrow && <span className='text-xs font-semibold uppercase tracking-[.2em] opacity-70 md:text-sm'>{t.eyebrow}</span>}
                <h2 className='text-2xl font-extrabold leading-tight tracking-tight md:text-5xl'>{t.title}</h2>
                <p className='text-sm opacity-80 md:text-base'>{t.desc}</p>
                <Link href={href} tabIndex={k === i ? 0 : -1} className={'inline-flex items-center gap-2 self-start rounded border px-5 py-2.5 text-sm font-bold md:px-6 md:py-3 md:text-base ' + (k % 2 ? 'border-paper bg-paper text-ink' : 'border-ink bg-ink text-paper')}>{t.cta}<span aria-hidden>→</span></Link>
              </div>
              <div className='flex items-center justify-center gap-2 py-6 pl-1 pr-12 pb-10 md:gap-4 md:px-8'>
                {s.images.length === 0 && <BoxIcon className='h-24 w-24 opacity-40' />}
                {s.images.slice(0, 3).map((u, m) => (
                  <div key={u} className={'aspect-square w-full max-w-[9.5rem] overflow-hidden rounded-lg border-2 border-gold bg-white shadow-lg md:max-w-[12rem] ' + (m === 0 ? '' : m === 1 ? 'hidden min-[420px]:block' : 'hidden md:block')}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt='' loading={k === 0 ? 'eager' : 'lazy'} className='h-full w-full object-contain' />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {n > 1 && (<>
        <button onClick={() => go(i - 1)} aria-label={tr(lang, 'hero.prev')} className='absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-ink bg-paper text-lg text-ink md:h-10 md:w-10 md:text-xl'>‹</button>
        <button onClick={() => go(i + 1)} aria-label={tr(lang, 'hero.next')} className='absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-ink bg-paper text-lg text-ink md:h-10 md:w-10 md:text-xl'>›</button>
        <div className='absolute inset-x-0 bottom-3 flex justify-center gap-2'>
          {slides.map((s, k) => (
            <button key={keyOf(s)} onClick={() => setI(k)} aria-label={'Slide ' + (k + 1)} aria-current={k === i} className={'h-1.5 w-7 rounded-full border shadow ' + (dark ? 'border-paper ' : 'border-ink ') + (k === i ? (dark ? 'bg-paper' : 'bg-ink') : 'bg-transparent')} />
          ))}
        </div>
      </>)}
    </section>
  );
}
