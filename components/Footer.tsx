'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Cat } from '@/lib/categories';
import { useStore } from './Store';
import { tr } from '@/lib/i18n';
import CatName from './CatName';
import Logo from './Logo';
import Reassurance from './Reassurance';

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

// La langue et la devise se changent dans l’en-tête (et dans le menu sur mobile), pas dans le pied de page.
export default function Footer({ categories }: { categories: Cat[] }) {
  const { lang } = useStore();
  const t = (k: string) => tr(lang, k);
  const en = lang === 'en';
  const L = en
    ? { shop: 'Shop', all: 'All categories', register: 'Create an account', countries: 'United States · Haiti', pay: 'Secure payments' }
    : { shop: 'Boutique', all: 'Toutes les catégories', register: 'Créer un compte', countries: 'États-Unis · Haïti', pay: 'Paiements sécurisés' };

  return (
    <>
      <Reassurance />
      <footer className='bg-ink text-paper'>
        <div className='mx-auto max-w-7xl px-4 py-8 md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8'>
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
            <li><Link href='/aide/livraison#suivi' className='hover:text-gold'>{t('ft.track')}</Link></li>
            <li><Link href='/aide/livraison' className='hover:text-gold'>{t('ft.ship')}</Link></li>
            <li><Link href='/aide/paiements' className='hover:text-gold'>{L.pay}</Link></li>
            <li><Link href='/aide/retours' className='hover:text-gold'>{t('ft.returns')}</Link></li>
          </Section>

          <Section title={t('ft.account')}>
            <li><Link href='/login' className='hover:text-gold'>{t('ft.login')}</Link></li>
            <li><Link href='/register' className='hover:text-gold'>{L.register}</Link></li>
            <li><Link href='/wishlist' className='hover:text-gold'>{t('ft.wish')}</Link></li>
            <li><Link href='/cart' className='hover:text-gold'>{t('ft.cart')}</Link></li>
          </Section>
        </div>

        <p className='border-t border-neutral-700 px-4 py-4 text-center text-xs text-neutral-400'>© {new Date().getFullYear()} AMIRCAL. {t('ft.rights')}</p>
      </footer>
    </>
  );
}
