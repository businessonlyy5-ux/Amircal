'use client';
import { useEffect, useState } from 'react';
import type { Testimonial } from '@/lib/testimonials';

function Stars({ n }: { n: number }) {
  return <span aria-label={n + ' sur 5'} className='text-gold-deep'>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

// Carrousel d’avis clients : défilement automatique, pause au survol et au toucher, flèches, points.
export default function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  useEffect(() => {
    if (paused || n < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, n]);
  if (n === 0) return null;
  const go = (k: number) => setI((k + n) % n);
  return (
    <div className='my-4' onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setTimeout(() => setPaused(false), 4000)} role='region' aria-roledescription='carousel' aria-label='Avis clients'>
      <div className='overflow-hidden rounded-lg bg-soft'>
        <div className='flex transition-transform duration-500 motion-reduce:transition-none' style={{ transform: 'translateX(-' + i * 100 + '%)' }}>
          {items.map((t, k) => (
            <figure key={t.id} aria-hidden={k !== i} className='flex w-full flex-none items-start gap-3 p-3.5'>
              {t.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.photo} alt={t.name} loading='lazy' className='h-20 w-20 flex-none rounded-lg object-cover' />
              ) : (
                <span aria-hidden className='grid h-20 w-20 flex-none place-items-center rounded-lg bg-ink text-2xl font-bold text-gold'>{t.name.charAt(0).toUpperCase()}</span>
              )}
              <div className='min-w-0 text-sm'>
                <figcaption className='flex flex-wrap items-center gap-x-2'><b className='text-base'>{t.name}</b><Stars n={t.rating} />{t.verified && <span className='rounded-sm bg-ink px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold'>Achat vérifié</span>}</figcaption>
                <blockquote className='mt-1 leading-snug text-graphite'>{t.body}</blockquote>
              </div>
            </figure>
          ))}
        </div>
      </div>
      {n > 1 && (
        <div className='mt-2 flex items-center justify-center gap-3'>
          <button onClick={() => go(i - 1)} aria-label='Avis précédent' className='h-7 w-7 rounded-full border border-ink text-sm'>‹</button>
          <div className='flex gap-1.5'>{items.map((t, k) => (<button key={t.id} onClick={() => setI(k)} aria-label={'Avis ' + (k + 1)} aria-current={k === i} className={'h-1.5 w-5 rounded-full border border-ink ' + (k === i ? 'bg-ink' : 'bg-transparent')} />))}</div>
          <button onClick={() => go(i + 1)} aria-label='Avis suivant' className='h-7 w-7 rounded-full border border-ink text-sm'>›</button>
        </div>
      )}
    </div>
  );
}
