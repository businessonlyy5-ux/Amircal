'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATEGORIES } from '@/lib/data';
import { tr } from '@/lib/i18n';
import { useStore } from './Store';
import { CartIcon, HeartIcon } from './Icons';
import Logo from './Logo';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const onProductPage = /^\/products\/[^/]+/.test(pathname ?? ''); // barre de catégories masquée sur les fiches produit
  const { currency, setCurrency, count, wish, lang } = useStore();
  const t = (k: string) => tr(lang, k);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [sugg, setSugg] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setSugg([]); return; }
    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const r = await fetch('/api/search?q=' + encodeURIComponent(term), { signal: ctl.signal });
        const d = (await r.json()) as { products: { id: number; name: string }[] };
        setSugg(d.products);
      } catch { /* annulé ou réseau */ }
    }, 250);
    return () => { clearTimeout(timer); ctl.abort(); };
  }, [q]);

  const go = (e: React.FormEvent) => { e.preventDefault(); setOpen(false); router.push('/products?q=' + encodeURIComponent(q.trim())); };
  return (
    <header className='sticky top-0 z-30 bg-ink text-paper'>
      <div className='mx-auto flex max-w-7xl items-center gap-3 px-4 py-3'>
        <Logo />
        <div className='hidden text-xs leading-tight lg:block'>{t('hdr.deliver')}<b className='block text-[13px]'>{currency === 'USD' ? t('hdr.us') : t('hdr.ht')}</b></div>
        <form onSubmit={go} role='search' className='relative min-w-0 flex-1'>
          <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onBlur={() => setTimeout(() => setOpen(false), 150)} aria-label={t('nav.search')} placeholder={t('hdr.placeholder')} autoComplete='off' className='w-full rounded px-3.5 py-3 text-ink' />
          {open && sugg.length > 0 && (
            <ul className='absolute left-0 right-0 top-full z-40 border border-ink bg-paper text-ink'>
              {sugg.map((p) => (<li key={p.id}><Link href={'/products/' + p.id} className='block truncate border-b border-neutral-200 px-3.5 py-2.5 hover:bg-soft'>{p.name}</Link></li>))}
              <li><button type='submit' className='w-full px-3.5 py-2.5 text-left font-medium hover:bg-soft'>{t('hdr.results')} « {q} »</button></li>
            </ul>
          )}
        </form>
        <button onClick={() => setCurrency(currency === 'USD' ? 'HTG' : 'USD')} aria-label='USD / HTG' className='hidden whitespace-nowrap px-2 text-sm md:block'>{currency === 'USD' ? 'US · USD' : 'HT · HTG'}</button>
        <Link href='/login' className='hidden px-2 text-sm md:block'>{t('hdr.account')}</Link>
        <Link href='/wishlist' aria-label={t('nav.wish')} className='relative hidden p-2 md:block'><HeartIcon className='h-6 w-6' />{wish.length > 0 && <span className='absolute right-0 top-0 min-w-4 rounded-full bg-paper px-1 text-[10px] font-bold text-ink'>{wish.length}</span>}</Link>
        <Link href='/cart' aria-label={t('nav.cart')} className='relative hidden p-2 md:block'><CartIcon className='h-6 w-6' />{count > 0 && <span className='absolute right-0 top-0 min-w-4 rounded-full bg-paper px-1 text-[10px] font-bold text-ink'>{count}</span>}</Link>
      </div>
      {!onProductPage && (
        <nav aria-label={t('nav.cats')} className='overflow-x-auto whitespace-nowrap border-t border-neutral-700'>
          <div className='mx-auto flex max-w-7xl'>
            <Link href='/products' className='px-3.5 py-2.5 text-[13.5px] font-bold hover:bg-graphite'>{t('hdr.all')}</Link>
            {CATEGORIES.map((c) => (<Link key={c} href={'/products?cat=' + encodeURIComponent(c)} className='px-3.5 py-2.5 text-[13.5px] hover:bg-graphite'>{t(c)}</Link>))}
          </div>
        </nav>
      )}
    </header>
  );
}
