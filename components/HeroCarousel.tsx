'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BoxIcon } from './Icons';

const SLIDES = [
  { t: 'Jusqu’à 60 % sur la maison', d: 'Cuisine, rangement, décoration et plus.', cta: 'Acheter maintenant', href: '/products?cat=' + encodeURIComponent('Maison & Cuisine') },
  { t: 'Nouveautés de la saison', d: 'Mode homme, femme et enfants.', cta: 'Découvrir', href: '/products?cat=' + encodeURIComponent('Mode femme') },
  { t: 'Électronique à prix réduit', d: 'Accessoires, audio et objets connectés.', cta: 'Voir les offres', href: '/products?cat=' + encodeURIComponent('Électronique') },
  { t: 'Livraison vers Haïti', d: 'Prix en HTG et suivi de commande inclus.', cta: 'Tout le catalogue', href: '/products' },
];

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);
  const go = (n: number) => setI((n + SLIDES.length) % SLIDES.length);
  const darkSlide = i % 2 === 1;
  return (
    <section aria-roledescription='carousel' aria-label='Promotions' onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className='relative overflow-hidden'>
      <div className='flex transition-transform duration-500 motion-reduce:transition-none' style={{ transform: 'translateX(-' + i * 100 + '%)' }}>
        {SLIDES.map((s, k) => (
          <div key={s.t} aria-hidden={k !== i} className={'grid min-h-[260px] w-full flex-none md:min-h-[340px] md:grid-cols-2 ' + (k % 2 ? 'bg-ink text-paper' : 'bg-soft text-ink')}>
            <div className='flex max-w-xl flex-col justify-center gap-3 px-14 pb-12 pt-8 md:px-14 md:pb-8'>
              <h2 className='text-3xl font-extrabold leading-none tracking-tight md:text-5xl'>{s.t}</h2>
              <p className='opacity-80'>{s.d}</p>
              <Link href={s.href} tabIndex={k === i ? 0 : -1} className={'self-start rounded border px-6 py-3 font-bold ' + (k % 2 ? 'border-paper bg-paper text-ink' : 'border-ink bg-ink text-paper')}>{s.cta}</Link>
            </div>
            <div className='hidden place-items-center text-neutral-400 md:grid'><BoxIcon className='h-40 w-40 opacity-50' /></div>
          </div>
        ))}
      </div>
      <button onClick={() => go(i - 1)} aria-label='Précédent' className='absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-ink bg-paper text-lg text-ink md:h-10 md:w-10 md:text-xl'>‹</button>
      <button onClick={() => go(i + 1)} aria-label='Suivant' className='absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-ink bg-paper text-lg text-ink md:h-10 md:w-10 md:text-xl'>›</button>
      <div className='absolute inset-x-0 bottom-3 flex justify-center gap-2'>
        {SLIDES.map((s, k) => (
          <button key={s.t} onClick={() => setI(k)} aria-label={'Slide ' + (k + 1)} aria-current={k === i} className={'h-1.5 w-7 rounded-full border ' + (darkSlide ? 'border-paper ' : 'border-ink ') + (k === i ? (darkSlide ? 'bg-paper' : 'bg-ink') : 'bg-transparent')} />
        ))}
      </div>
    </section>
  );
}
