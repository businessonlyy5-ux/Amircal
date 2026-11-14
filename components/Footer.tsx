'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Cat } from '@/lib/categories';
import { useStore } from './Store';
import { tr } from '@/lib/i18n';
import CatName from './CatName';
import Logo from './Logo';
import Reassurance from './Reassurance';

// Liens : noir sur fond blanc, or foncé (#8A6B1E, contraste suffisant) au survol.
const link = 'text-neutral-800 hover:text-[#8A6B1E] hover:underline';

// Section de liens : accordéon sur mobile, colonne sur ordinateur.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <details className='group border-b border-neutral-300 md:hidden'>
        <summary className='flex cursor-pointer list-none items-center justify-between py-4 font-semibold hover:text-[#8A6B1E]'>{title}<span aria-hidden className='text-xl transition-transform group-open:rotate-45'>+</span></summary>
        <ul className='space-y-3 pb-4 text-sm'>{children}</ul>
      </details>
      <div className='hidden md:block'>
        <h2 className='mb-3 inline-block border-b-2 border-gold pb-1 text-sm font-bold uppercase tracking-[.14em] text-ink'>{title}</h2>
        <ul className='space-y-2.5 text-sm'>{children}</ul>
      </div>
    </>
  );
}

// Pied de page blanc, texte noir. Le logo est blanc : on l’inverse (invert) pour qu’il apparaisse en noir.
// La langue se change dans l’en-tête (et dans le menu sur mobile). Boutique états-unienne : USD uniquement.
export default function Footer({ categories }: { categories: Cat[] }) {
  const { lang } = useStore();
  const t = (k: string) => tr(lang, k);
  const en = lang === 'en';
  const L = en
    ? { shop: 'Shop', all: 'All categories', register: 'Create an account', countries: 'United States · Delivery in 3 to 5 days', pay: 'Secure payments' }
    : { shop: 'Boutique', all: 'Toutes les catégories', register: 'Créer un compte', countries: 'États-Unis · Livraison en 3 à 5 jours', pay: 'Paiements sécurisés' };

  return (
    <>
      <Reassurance />
      <footer className='bg-paper text-ink'>
        <div className='mx-auto max-w-7xl px-4 py-8 md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8'>
          <div className='mb-6 md:mb-0'>
            <Logo className='mb-3 h-6 invert' />
            <p className='text-sm text-neutral-800'>{t('ft.tag')}</p>
            <p className='mt-1 text-sm text-neutral-600'>{L.countries}</p>
          </div>

          <Section title={L.shop}>
            <li><Link href='/products' className={link}>{L.all}</Link></li>
            {categories.slice(0, 6).map((c) => (<li key={c.slug}><Link href={'/products?cat=' + c.slug} className={link}><CatName c={c} /></Link></li>))}
          </Section>

          <Section title={t('ft.help')}>
            <li><Link href='/aide/livraison#suivi' className={link}>{t('ft.track')}</Link></li>
            <li><Link href='/aide/livraison' className={link}>{t('ft.ship')}</Link></li>
            <li><Link href='/aide/paiements' className={link}>{L.pay}</Link></li>
            <li><Link href='/aide/retours' className={link}>{t('ft.returns')}</Link></li>
          </Section>

          <Section title={t('ft.account')}>
            <li><Link href='/login' className={link}>{t('ft.login')}</Link></li>
            <li><Link href='/register' className={link}>{L.register}</Link></li>
            <li><Link href='/wishlist' className={link}>{t('ft.wish')}</Link></li>
            <li><Link href='/cart' className={link}>{t('ft.cart')}</Link></li>
          </Section>
        </div>

        <p className='border-t border-neutral-300 bg-soft px-4 py-4 text-center text-xs text-neutral-600'>© {new Date().getFullYear()} AMIRCAL. {t('ft.rights')}</p>
      </footer>
    </>
  );
}
