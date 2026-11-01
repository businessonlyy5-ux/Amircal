'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES, PRODUCTS } from '@/lib/data';
import { useStore } from './Store';
import { CartIcon, HeartIcon } from './Icons';
import Logo from './Logo';

export default function Header() {
  const router = useRouter();
  const { currency, setCurrency, count, wish } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const s = q.trim().toLowerCase();
  const sugg = s ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(s)).slice(0, 5) : [];
  const go = (e: React.FormEvent) => { e.preventDefault(); setOpen(false); router.push('/products?q=' + encodeURIComponent(q.trim())); };
  return (
    <header className='sticky top-0 z-30 bg-ink text-paper'>
      <div className='mx-auto flex max-w-7xl items-center gap-3 px-4 py-3'>
        <Logo />
        <div className='hidden text-xs leading-tight lg:block'>Livrer à<b className='block text-[13px]'>{currency === 'USD' ? 'États-Unis' : 'Haïti'}</b></div>
        <form onSubmit={go} role='search' className='relative min-w-0 flex-1'>
          <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onBlur={() => setTimeout(() => setOpen(false), 150)} aria-label='Rechercher' placeholder='Que recherchez-vous ?' autoComplete='off' className='w-full rounded px-3.5 py-3 text-ink' />
          {open && sugg.length > 0 && (
            <ul className='absolute left-0 right-0 top-full z-40 border border-ink bg-paper text-ink'>
              {sugg.map((p) => (<li key={p.id}><Link href={'/products/' + p.id} className='block border-b border-neutral-200 px-3.5 py-2.5 hover:bg-soft'>{p.name}</Link></li>))}
              <li><button type='submit' className='w-full px-3.5 py-2.5 text-left font-medium hover:bg-soft'>Voir tous les résultats pour « {q} »</button></li>
            </ul>
          )}
        </form>
        <button onClick={() => setCurrency(currency === 'USD' ? 'HTG' : 'USD')} aria-label='Changer de pays et de devise' className='hidden whitespace-nowrap px-2 text-sm md:block'>{currency === 'USD' ? 'US · USD' : 'HT · HTG'}</button>
        <Link href='/login' className='hidden px-2 text-sm md:block'>Compte</Link>
        <Link href='/wishlist' aria-label='Favoris' className='relative hidden p-2 md:block'><HeartIcon className='h-6 w-6' />{wish.length > 0 && <span className='absolute right-0 top-0 min-w-4 rounded-full bg-paper px-1 text-[10px] font-bold text-ink'>{wish.length}</span>}</Link>
        <Link href='/cart' aria-label='Panier' className='relative hidden p-2 md:block'><CartIcon className='h-6 w-6' />{count > 0 && <span className='absolute right-0 top-0 min-w-4 rounded-full bg-paper px-1 text-[10px] font-bold text-ink'>{count}</span>}</Link>
      </div>
      <nav aria-label='Catégories' className='overflow-x-auto whitespace-nowrap border-t border-neutral-700'>
        <div className='mx-auto flex max-w-7xl'>
          <Link href='/products' className='px-3.5 py-2.5 text-[13.5px] font-bold hover:bg-graphite'>Toutes les catégories</Link>
          {CATEGORIES.map((c) => (<Link key={c} href={'/products?cat=' + encodeURIComponent(c)} className='px-3.5 py-2.5 text-[13.5px] hover:bg-graphite'>{c}</Link>))}
        </div>
      </nav>
    </header>
  );
}
