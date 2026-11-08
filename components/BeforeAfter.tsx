'use client';
import { useState } from 'react';

// Comparateur avant / après : on fait glisser le curseur (doigt ou souris) pour révéler l’une ou l’autre photo.
export default function BeforeAfter({ before, after, alt, labelBefore = 'Avant', labelAfter = 'Après' }: { before: string; after: string; alt: string; labelBefore?: string; labelAfter?: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className='relative aspect-[4/5] w-full select-none overflow-hidden rounded-lg bg-neutral-200 md:aspect-square'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt={alt + ' — ' + labelAfter} loading='lazy' draggable={false} className='absolute inset-0 h-full w-full object-cover' />
      <div className='absolute inset-0' style={{ clipPath: 'inset(0 ' + (100 - pos) + '% 0 0)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={alt + ' — ' + labelBefore} loading='lazy' draggable={false} className='h-full w-full object-cover' />
      </div>
      <span className='pointer-events-none absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white'>{labelBefore}</span>
      <span className='pointer-events-none absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white'>{labelAfter}</span>
      <div className='pointer-events-none absolute inset-y-0 w-0.5 bg-white' style={{ left: pos + '%' }}>
        <span className='absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black/50 text-sm text-white'>‹ ›</span>
      </div>
      <input type='range' min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label='Comparer avant et après' className='absolute inset-0 h-full w-full cursor-ew-resize touch-pan-y opacity-0' />
    </div>
  );
}
