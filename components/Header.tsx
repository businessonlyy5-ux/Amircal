'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Cat } from '@/lib/categories';
import { tr } from '@/lib/i18n';
import { useStore } from './Store';
import { HeartIcon, SearchIcon } from './Icons';
import CatName from './CatName';
import Flag from './Flag';
import Logo from './Logo';

// Icônes fines (trait 1,6) de l’en-tête.
const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24', 'aria-hidden': true } as const;
const MenuIcon = ({ className = 'h-7 w-7' }: { className?: string }) => (<svg {...line} className={className}><path d='M3 6h18M3 12h18M3 18h18' /></svg>);
const UserIcon = ({ className = 'h-7 w-7' }: { className?: string }) => (<svg {...line} className={className}><circle cx='12' cy='8' r='4' /><path d='M4 21c0-4 3.6-6 8-6s8 2 8 6z' /></svg>);
const BagIcon = ({ className = 'h-7 w-7' }: { className?: string }) => (<svg {...line} className={className}><path d='M5.5 8h13l-1 12.5h-11z' /><path d='M9 8V6.5a3 3 0 016 0V8' /></svg>);
const ChevronIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (<svg {...line} className={className}><path d='M9 5l7 7-7 7' /></svg>);
const CloseIcon = ({ className = 'h-6 w-6' }: { className?: string }) => (<svg {...line} className={className}><path d='M5 5l14 14M19 5L5 19' /></svg>);

export default function Header({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const onProductPage = /^\/products\/[^/]+/.test(pathname ?? ''); // barre de catégories masquée sur les fiches produit
  const { count, wish, lang, setLang } = useStore();
  const t = (k: string) => tr(lang, k);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
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

  // Menu mobile : se ferme au changement de page et avec Échap ; la page ne défile pas derrière.
  useEffect(() => { setMenu(false); }, [pathname]);
  useEffect(() => {
    if (!menu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc); };
  }, [menu]);

  const go = (e: React.FormEvent) => { e.preventDefault(); setOpen(false); router.push('/products?q=' + encodeURIComponent(q.trim())); };
  const fr = lang === 'fr';
  const L = fr
    ? { signin: 'Se connecter ou s’inscrire', menu: 'Menu', close: 'Fermer', cats: 'Catégories', lang: 'Langue' }
    : { signin: 'Sign in or register', menu: 'Menu', close: 'Close', cats: 'Categories', lang: 'Language' };

  // Barre de recherche en pilule (même formulaire sur mobile, sous la ligne du logo, et sur ordinateur, dans la ligne du logo).
  const search = (
    <form onSubmit={go} role='search' className='relative min-w-0 flex-1'>
      <SearchIcon className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink' />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onBlur={() => setTimeout(() => setOpen(false), 150)} aria-label={t('nav.search')} placeholder={t('hdr.placeholder')} autoComplete='off' className='w-full rounded-full bg-soft py-3 pl-12 pr-4 text-ink placeholder:text-graphite' />
      {open && sugg.length > 0 && (
        <ul className='absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-xl border border-neutral-200 bg-paper text-ink shadow-lg'>
          {sugg.map((p) => (<li key={p.id}><Link href={'/products/' + p.id} className='block truncate border-b border-neutral-200 px-4 py-2.5 hover:bg-soft'>{p.name}</Link></li>))}
          <li><button type='submit' className='w-full px-4 py-2.5 text-left font-medium hover:bg-soft'>{t('hdr.results')} « {q} »</button></li>
        </ul>
      )}
    </form>
  );

  return (
    <>
      <header className='hdr-light sticky top-0 z-30 bg-paper text-ink'>
        <div className='mx-auto flex max-w-7xl items-center gap-1 px-3 pb-1 pt-2 md:gap-3 md:px-4 md:py-3'>
          <button onClick={() => setMenu(true)} aria-label={L.menu} aria-expanded={menu} className='flex-none p-2 md:hidden'><MenuIcon /></button>
          <Logo className='h-[22px] invert md:h-6' />
          <div className='hidden items-center gap-2 text-xs leading-tight lg:flex'><Flag code='US' className='h-4 w-6' /><span>{t('hdr.deliver')}<b className='block text-[13px]'>{t('hdr.us')}</b></span></div>
          <div className='hidden min-w-0 flex-1 md:flex'>{search}</div>
          <div className='ml-auto flex flex-none items-center md:ml-0 md:gap-1'>
            <button onClick={() => setLang(fr ? 'en' : 'fr')} aria-label={fr ? 'Switch to English' : 'Passer en français'} className='hidden items-center gap-1.5 whitespace-nowrap px-2 text-sm md:flex'><Flag code={fr ? 'FR' : 'US'} />{fr ? 'FR' : 'EN'}</button>
            <Link href='/login' aria-label={t('hdr.account')} className='flex items-center gap-2 p-2 text-sm'><UserIcon /><span className='hidden md:inline'>{t('hdr.account')}</span></Link>
            <Link href='/wishlist' aria-label={t('nav.wish')} className='relative hidden p-2 md:block'><HeartIcon className='h-7 w-7' />{wish.length > 0 && <span className='absolute right-0 top-0 min-w-4 rounded-full bg-ink px-1 text-center text-[10px] font-bold text-paper'>{wish.length}</span>}</Link>
            <Link href='/cart' aria-label={t('nav.cart')} className='relative p-2'><BagIcon />{count > 0 && <span className='absolute right-0 top-0 min-w-4 rounded-full bg-ink px-1 text-center text-[10px] font-bold text-paper'>{count}</span>}</Link>
          </div>
        </div>
        <div className='px-4 pb-3 pt-1 md:hidden'>{search}</div>
        {!onProductPage && (
          <nav aria-label={t('nav.cats')} className='hidden overflow-x-auto whitespace-nowrap border-t border-neutral-200 md:block'>
            <div className='mx-auto flex max-w-7xl'>
              <Link href='/products' className='px-3.5 py-2.5 text-[13.5px] font-bold'>{t('hdr.all')}</Link>
              {categories.map((c) => (<Link key={c.slug} href={'/products?cat=' + c.slug} className='px-3.5 py-2.5 text-[13.5px]'><CatName c={c} /></Link>))}
            </div>
          </nav>
        )}
      </header>

      {menu && (
        <div className='fixed inset-0 z-50 md:hidden' role='dialog' aria-modal='true' aria-label={L.menu}>
          <button onClick={() => setMenu(false)} aria-label={L.close} className='absolute inset-0 bg-black/50' />
          <aside className='absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-paper text-ink shadow-2xl'>
            <div className='flex items-center justify-between px-3 py-3'>
              <Logo className='h-[22px] invert' />
              <button onClick={() => setMenu(false)} aria-label={L.close} className='p-2'><CloseIcon /></button>
            </div>
            <Link href='/login' className='flex items-center justify-between border-y border-neutral-200 px-4 py-4 hover:bg-soft'>
              <span className='flex items-center gap-3'><UserIcon className='h-8 w-8' />{L.signin}</span>
              <ChevronIcon />
            </Link>
            <p className='px-4 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[.16em] text-neutral-500'>{L.cats}</p>
            <nav aria-label={t('nav.cats')}>
              <Link href='/products' className='flex items-center justify-between px-4 py-3.5 font-bold hover:bg-soft'>{t('hdr.all')}<ChevronIcon /></Link>
              {categories.map((c) => (<Link key={c.slug} href={'/products?cat=' + c.slug} className='flex items-center justify-between px-4 py-3.5 hover:bg-soft'><CatName c={c} /><ChevronIcon /></Link>))}
            </nav>
            <div className='mt-auto space-y-1 border-t border-neutral-200 px-4 py-3 text-sm'>
              <Link href='/wishlist' className='flex items-center justify-between py-2'><span className='flex items-center gap-2'><HeartIcon className='h-5 w-5' />{t('nav.wish')}</span>{wish.length > 0 && <b>{wish.length}</b>}</Link>
              <button onClick={() => setLang(fr ? 'en' : 'fr')} className='flex w-full items-center justify-between py-2'><span>{L.lang}</span><span className='flex items-center gap-1.5 font-medium'><Flag code={fr ? 'FR' : 'US'} />{fr ? 'Français' : 'English'}</span></button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
