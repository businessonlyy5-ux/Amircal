'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useStore } from './Store';
import { formatMoney } from '@/lib/data';

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden className='h-9 w-9 flex-none'>{children}</svg>
);

// Bloc de réassurance affiché juste avant le pied de page : livraison, paiements, retours.
export default function Reassurance() {
  const { lang, currency } = useStore();
  const en = lang === 'en';
  const threshold = formatMoney(currency === 'USD' ? 50 : 100, currency);
  const items = en
    ? [
        { href: '/aide/livraison', title: 'Free shipping', text: 'on orders over ' + threshold + ', tracking included', cta: 'Learn more', icon: <><path d='M3 6h11v10H3z' /><path d='M14 9h4l3 3v4h-7z' /><circle cx='7' cy='18' r='1.8' /><circle cx='17' cy='18' r='1.8' /></> },
        { href: '/aide/paiements', title: 'Secure payments', text: 'No card stored on AMIRCAL, payment through a secure external provider', cta: 'Learn more', icon: <><rect x='3' y='6' width='18' height='12' rx='2' /><path d='M3 10h18' /><path d='M7 15h4' /></> },
        { href: '/aide/retours', title: 'Returns', text: 'within 14 days', cta: 'Return an item', icon: <><path d='M4 12a8 8 0 1 0 2.5-5.8' /><path d='M4 4v4h4' /><path d='M12 8l3 1.5v3L12 14l-3-1.5v-3z' /></> },
      ]
    : [
        { href: '/aide/livraison', title: 'Livraison offerte', text: 'dès ' + threshold + ' d’achats, suivi de colis inclus', cta: 'En savoir plus', icon: <><path d='M3 6h11v10H3z' /><path d='M14 9h4l3 3v4h-7z' /><circle cx='7' cy='18' r='1.8' /><circle cx='17' cy='18' r='1.8' /></> },
        { href: '/aide/paiements', title: 'Paiements sécurisés', text: 'Aucune carte stockée sur AMIRCAL, paiement via un prestataire externe sécurisé', cta: 'En savoir plus', icon: <><rect x='3' y='6' width='18' height='12' rx='2' /><path d='M3 10h18' /><path d='M7 15h4' /></> },
        { href: '/aide/retours', title: 'Retours', text: 'sous 14 jours', cta: 'Retourner un article', icon: <><path d='M4 12a8 8 0 1 0 2.5-5.8' /><path d='M4 4v4h4' /><path d='M12 8l3 1.5v3L12 14l-3-1.5v-3z' /></> },
      ];
  return (
    <section aria-label={en ? 'Our commitments' : 'Nos engagements'} className='mt-8 border-t border-neutral-200 bg-paper text-ink'>
      <ul className='mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-3 md:gap-10'>
        {items.map((x) => (
          <li key={x.href} className='flex gap-4'>
            <Icon>{x.icon}</Icon>
            <div>
              <b className='block text-base'>{x.title}</b>
              <p className='mt-0.5 text-neutral-700'>{x.text}</p>
              <Link href={x.href} className='mt-2 inline-block underline underline-offset-4 hover:text-gold-deep'>{x.cta}</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
