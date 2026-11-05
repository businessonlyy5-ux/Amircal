'use client';
import Link from 'next/link';
import { useStore } from './Store';
import { tr } from '@/lib/i18n';
import Logo from './Logo';

export default function Footer() {
  const { lang, setLang } = useStore();
  const t = (k: string) => tr(lang, k);
  const pill = (on: boolean) => 'rounded border px-3 py-1 text-xs font-bold tracking-widest ' + (on ? 'border-gold bg-gold text-ink' : 'border-neutral-600 text-paper');
  return (
    <footer className='mt-8 bg-ink text-paper'>
      <div className='mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-sm leading-8 md:grid-cols-4'>
        <div className='col-span-2 md:col-span-1'><Logo className='mb-2 h-6' />{t('ft.tag')}<br />{lang === 'en' ? 'United States' : 'États-Unis'} · {lang === 'en' ? 'Haiti' : 'Haïti'}</div>
        <div><b className='block'>{t('ft.help')}</b>{t('ft.track')}<br />{t('ft.ship')}<br />{t('ft.returns')}</div>
        <div><b className='block'>{t('ft.account')}</b><Link href='/login'>{t('ft.login')}</Link><br /><Link href='/wishlist'>{t('ft.wish')}</Link><br /><Link href='/cart'>{t('ft.cart')}</Link></div>
        <div>
          <b className='block'>{t('ft.cur')}</b>USD · HTG<br />{t('ft.secure')}
          <b className='mt-2 block'>{t('ft.lang')}</b>
          <div role='group' aria-label={t('ft.lang')} className='mt-1 flex gap-2'>
            <button onClick={() => setLang('fr')} aria-pressed={lang === 'fr'} lang='fr' className={pill(lang === 'fr')}>FR</button>
            <button onClick={() => setLang('en')} aria-pressed={lang === 'en'} lang='en' className={pill(lang === 'en')}>EN</button>
          </div>
        </div>
      </div>
      <p className='border-t border-neutral-700 px-4 py-4 text-center text-xs text-neutral-400'>© AMIRCAL. {t('ft.rights')}</p>
    </footer>
  );
}
