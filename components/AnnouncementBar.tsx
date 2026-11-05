'use client';
import { formatMoney } from '@/lib/data';
import { useStore } from './Store';

export default function AnnouncementBar() {
  const { currency } = useStore();
  const threshold = currency === 'USD' ? 50 : 100;
  return (
    <div className='bg-ink px-4 py-1.5 text-center text-[11px] font-medium uppercase tracking-[.16em] text-gold md:text-xs'>
      Livraison offerte dès {formatMoney(threshold, currency)} <span aria-hidden className='mx-2'>◆</span> Suivi de colis inclus <span aria-hidden className='mx-2 hidden sm:inline'>◆</span><span className='hidden sm:inline'>USD &amp; HTG</span>
    </div>
  );
}
