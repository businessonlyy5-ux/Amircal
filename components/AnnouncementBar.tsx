'use client';
import { formatMoney } from '@/lib/data';
import { tr } from '@/lib/i18n';
import { useStore } from './Store';

export default function AnnouncementBar() {
  const { lang } = useStore();
  return (
    <div className='bg-ink px-4 py-1.5 text-center text-[11px] font-medium uppercase tracking-[.16em] text-gold md:text-xs'>
      {tr(lang, 'ann.free')} {formatMoney(50, 'USD')} <span aria-hidden className='mx-2'>◆</span> {tr(lang, 'ann.days')} <span aria-hidden className='mx-2 hidden sm:inline'>◆</span><span className='hidden sm:inline'>{tr(lang, 'ann.track')}</span>
    </div>
  );
}
