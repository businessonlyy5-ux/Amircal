'use client';
import Link from 'next/link';
import { useStore } from './Store';
import { RATE_HTG } from '@/lib/data';
import { tr } from '@/lib/i18n';
import Flag from './Flag';
import Logo from './Logo';

export default function Footer() {
  const { lang, setLang, currency, setCurrency } = useStore();
  const t = (k: string) => tr(lang, k);
  const pill = (on: boolean) => 'inline-flex items-center gap-2 rounded border px-3 py-1.5 text-xs font-bold tracking-widest ' + (on ? 'border-gold bg-gold text-ink' : 'border-neutral-600 text-paper');
  const en = lang === 'en';
  return (
    <footer className='mt-8 bg-ink text-paper'>
      <div className='mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-sm leading-8 md:grid-cols-4'>
        <div className='col-span-2 md:col-span-1'><Logo className='mb-2 h-6' />{t('ft.tag')}<br />{en ? 'United States' : 'États-Unis'} · {en ? 'Haiti' : 'Haïti'}</div>
        <div><b className='block'>{t('ft.help')}</b>{t('ft.track')}<br />{t('ft.ship')}<br />{t('ft.returns')}</div>
        <div><b className='block'>{t('ft.account')}</b><Link href='/login'>{t('ft.login')}</Link><br /><Link href='/wishlist'>{t('ft.wish')}</Link><br /><Link href='/cart'>{t('ft.cart')}</Link></div>
        <div className='col-span-2 md:col-span-1'>
          <b className='block'>{t('ft.lang')}</b>
          <div role='group' aria-label={t('ft.lang')} className='mt-1 flex flex-wrap gap-2'>
            <button onClick={() => setLang('fr')} aria-pressed={lang === 'fr'} aria-label='Français' lang='fr' className={pill(lang === 'fr')}><Flag code='HT' />FR</button>
            <button onClick={() => setLang('en')} aria-pressed={lang === 'en'} aria-label='English' lang='en' className={pill(lang === 'en')}><Flag code='US' />EN</button>
          </div>
          <b className='mt-2 block'>{t('ft.cur')}</b>
          <div role='group' aria-label={t('ft.cur')} className='mt-1 flex flex-wrap gap-2'>
            <button onClick={() => setCurrency('USD')} aria-pressed={currency === 'USD'} aria-label={en ? 'US dollar' : 'Dollar américain'} className={pill(currency === 'USD')}>USD</button>
            <button onClick={() => setCurrency('HTG')} aria-pressed={currency === 'HTG'} aria-label={en ? 'Haitian gourde' : 'Gourde haïtienne'} className={pill(currency === 'HTG')}>HTG</button>
          </div>
          <p className='text-xs text-neutral-400'>{currency === 'USD' ? (en ? 'US dollar' : 'Dollar américain') : (en ? 'Haitian gourde' : 'Gourde haïtienne')} · 1 USD ≈ {RATE_HTG.toLocaleString(en ? 'en-US' : 'fr-FR', { maximumFractionDigits: 2 })} HTG</p>
          <p className='text-xs text-neutral-400'>{t('ft.secure')}</p>
        </div>
      </div>
      <p className='border-t border-neutral-700 px-4 py-4 text-center text-xs text-neutral-400'>© AMIRCAL. {t('ft.rights')}</p>
    </footer>
  );
}
