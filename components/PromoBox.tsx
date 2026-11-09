'use client';
import { useState } from 'react';
import type { Promo } from '@/lib/discounts';

// Champ « code promo » : à placer hors d’un autre formulaire.
export default function PromoBox({ promo, apply, clear }: { promo: Promo | null; apply: (c: string) => Promise<{ ok: boolean; message: string }>; clear: () => void }) {
  const [v, setV] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  if (promo) return (
    <div className='mt-3 flex items-center justify-between gap-2 rounded border border-gold bg-soft px-3 py-2 text-sm'>
      <span className='min-w-0 truncate'>Code <b>{promo.code}</b> appliqué{promo.percent ? ' (−' + promo.percent + ' %)' : ''}</span>
      <button type='button' onClick={clear} className='flex-none underline'>Retirer</button>
    </div>
  );
  return (
    <div className='mt-3'>
      <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); const r = await apply(v); setMsg(r.ok ? '' : r.message); if (r.ok) setV(''); setBusy(false); }} className='flex gap-2'>
        <input value={v} onChange={(e) => setV(e.target.value)} aria-label='Code promo' placeholder='Code promo' autoComplete='off' className='min-w-0 flex-1 rounded border border-ink px-3 py-2.5 text-base uppercase placeholder:normal-case' />
        <button disabled={busy} className='flex-none rounded border-2 border-ink px-4 font-bold disabled:opacity-50'>{busy ? '…' : 'Appliquer'}</button>
      </form>
      {msg && <p role='status' className='mt-1 text-xs font-semibold'>{msg}</p>}
    </div>
  );
}
