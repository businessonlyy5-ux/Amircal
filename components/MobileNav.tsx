'use client';
import Link from 'next/link';
import { useStore } from './Store';
import { CartIcon, GridIcon, HeartIcon, HomeIcon, SearchIcon } from './Icons';

export default function MobileNav() {
  const { count, wish } = useStore();
  const items = [
    { href: '/', label: 'Accueil', icon: <HomeIcon className='h-6 w-6' /> },
    { href: '/products', label: 'Catégories', icon: <GridIcon className='h-6 w-6' /> },
    { href: '/products?q=', label: 'Recherche', icon: <SearchIcon className='h-6 w-6' /> },
    { href: '/wishlist', label: 'Favoris', icon: <HeartIcon className='h-6 w-6' />, n: wish.length },
    { href: '/cart', label: 'Panier', icon: <CartIcon className='h-6 w-6' />, n: count },
  ];
  return (
    <nav aria-label='Navigation mobile' className='fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-ink bg-paper pb-[env(safe-area-inset-bottom)] pt-1.5 md:hidden'>
      {items.map((i) => (
        <Link key={i.label} href={i.href} className='relative flex flex-col items-center gap-0.5 px-2 py-1 text-[11px]'>
          {i.icon}{i.label}
          {!!i.n && <span className='absolute right-0 top-0 min-w-4 rounded-full bg-ink px-1 text-center text-[10px] font-bold text-paper'>{i.n}</span>}
        </Link>
      ))}
    </nav>
  );
}
