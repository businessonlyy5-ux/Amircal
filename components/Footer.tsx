'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Cat } from '@/lib/categories';
import { useStore } from './Store';
import { RATE_HTG } from '@/lib/data';
import { tr } from '@/lib/i18n';
import CatName from './CatName';
import Flag from './Flag';
import Logo from './Logo';

// Section de liens : accordéon sur mobile, colonne sur ordinateur.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <details className='group border-b border-neutral-700 md:hidden'>
        <summary className='flex cursor-pointer list-none items-center justify-between py-4 font-semibold hover:text-gold'>{title}<span aria-hidden className='text-xl transition-transform group-open:rotate-45'>+</span></summary>
        <ul className='space-y-3 pb-4 text-sm text-neutral-300'>{children}</ul>
      </details>
      <div className='hidden md:block'>
        <h2 className='mb-3 text-sm font-bold uppercase tracking-[.14em] text-gold'>{title}</h2>
        <ul className='space-y-2.5 text-sm text-neutral-300'>{children}</ul>
      </div>
    </>
  );
}

export default function Footer({ categories }: { categories: Cat[] }) {
  const { lang, setLang, currency, setCurrency } = useStore();
  const t = (k: string) => tr(lang, k);
  const en = lang === 'en';
  const pill = (on: boolean) => 'inline-flex items-center gap-2 rounded border px-3 py-1.5 text-xs font-bold tracking-widest ' + (on ? 'border-gold bg-gold text-ink' : 'border-neutral-600 text-paper');
  const L = en
    ? {
        shop: 'Shop', all: 'All categories', register: 'Create an account', countries: 'United States · Haiti',
        perks: [['Order tracking', 'Tracking number as soon as it ships'], ['Secure payment', 'No card stored on AMIRCAL'], ['USD and HTG', 'Prices in your currency'], ['Customer service', 'A team to help you']],
      }
    : {
        shop: 'Boutique', all: 'Toutes les catégories', register: 'Créer un compte', countries: 'États-Unis · Haïti',
        perks: [['Suivi de commande', 'Numéro de suivi dès l’expédition'], ['Paiement sécurisé', 'Aucune carte stockée sur AMIRCAL'], ['USD et HTG', 'Prix affichés dans votre devise'], ['Service client', 'Une équipe pour vous aider']],
      };

  return (
    <footer className='mt-8 bg-ink text-paper'>
      <ul className='mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-4 px-4 py-6 text-center text-xs md:grid-cols-4 md:text-sm'>
        {L.perks.map(([a, b]) => (<li key={a}><b className='block'>{a}</b><span className='text-neutral-400'>{b}</span></li>))}
      </ul>

      <div className='border-t border-neutral-700'>
        <div className='mx-auto max-w-7xl px-4 py-8 md:grid md:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr] md:gap-8'>
          <div className='mb-6 md:mb-0'>
            <Logo className='mb-3 h-6' />
            <p className='text-sm text-neutral-300'>{t('ft.tag')}</p>
            <p className='mt-1 text-sm text-neutral-400'>{L.countries}</p>
          </div>

          <Section title={L.shop}>
            <li><Link href='/products' className='hover:text-gold'>{L.all}</Link></li>
            {categories.slice(0, 6).map((c) => (<li key={c.slug}><Link href={'/products?cat=' + c.slug} className='hover:text-gold'><CatName c={c} /></Link></li>))}
          </Section>

          <Section title={t('ft.help')}>
            <li>{t('ft.track')}</li>
            <li>{t('ft.ship')}</li>
            <li>{t('ft.returns')}</li>
          </Section>

          <Section title={t('ft.account')}>
            <li><Link href='/login' className='hover:text-gold'>{t('ft.login')}</Link></li>
            <li><Link href='/register' className='hover:text-gold'>{L.register}</Link></li>
            <li><Link href='/wishlist' className='hover:text-gold'>{t('ft.wish')}</Link></li>
            <li><Link href='/cart' className='hover:text-gold'>{t('ft.cart')}</Link></li>
          </Section>

          <div className='mt-6 md:mt-0'>
            <b className='block'>{t('ft.lang')}</b>
            <div role='group' aria-label={t('ft.lang')} className='mt-2 flex flex-wrap gap-2'>
              <button onClick={() => setLang('fr')} aria-pressed={lang === 'fr'} aria-label='Français' lang='fr' className={pill(lang === 'fr')}><Flag code='HT' />FR</button>
              <button onClick={() => setLang('en')} aria-pressed={lang === 'en'} aria-label='English' lang='en' className={pill(lang === 'en')}><Flag code='US' />EN</button>
            </div>
            <b className='mt-4 block'>{t('ft.cur')}</b>
            <div role='group' aria-label={t('ft.cur')} className='mt-2 flex flex-wrap gap-2'>
              <button onClick={() => setCurrency('USD')} aria-pressed={currency === 'USD'} aria-label={en ? 'US dollar' : 'Dollar américain'} className={pill(currency === 'USD')}>USD</button>
              <button onClick={() => setCurrency('HTG')} aria-pressed={currency === 'HTG'} aria-label={en ? 'Haitian gourde' : 'Gourde haïtienne'} className={pill(currency === 'HTG')}>HTG</button>
            </div>
            <p className='mt-3 text-xs text-neutral-400'>{currency === 'USD' ? (en ? 'US dollar' : 'Dollar américain') : (en ? 'Haitian gourde' : 'Gourde haïtienne')} · 1 USD ≈ {RATE_HTG.toLocaleString(en ? 'en-US' : 'fr-FR', { maximumFractionDigits: 2 })} HTG</p>
            <p className='mt-1 text-xs text-neutral-400'>{t('ft.secure')}</p>
          </div>
        </div>
      </div>

      <p className='border-t border-neutral-700 px-4 py-4 text-center text-xs text-neutral-400'>© {new Date().getFullYear()} AMIRCAL. {t('ft.rights')}</p>
    </footer>
  );
}
