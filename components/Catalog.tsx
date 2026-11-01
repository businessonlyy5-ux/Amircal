'use client';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES, PRODUCTS, RATE_HTG } from '@/lib/data';
import { useStore } from './Store';
import ProductCard from './ProductCard';

const PER = 12;
export default function Catalog() {
  const params = useSearchParams();
  const { currency } = useStore();
  const q = (params.get('q') ?? '').toLowerCase();
  const initialCat = params.get('cat');
  const [cats, setCats] = useState<string[]>(initialCat ? [initialCat] : []);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [stock, setStock] = useState(false);
  const [sort, setSort] = useState('rel');
  const [page, setPage] = useState(1);
  const [showF, setShowF] = useState(false);
  const k = currency === 'USD' ? 1 : RATE_HTG;

  const list = useMemo(() => {
    const r = PRODUCTS.filter((p) => (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) && (!cats.length || cats.includes(p.category)) && (min === '' || p.price * k >= +min) && (max === '' || p.price * k <= +max) && (!stock || p.stock > 0));
    if (sort === 'asc') r.sort((a, b) => a.price - b.price);
    if (sort === 'desc') r.sort((a, b) => b.price - a.price);
    if (sort === 'rate') r.sort((a, b) => b.rating - a.rating);
    if (sort === 'disc') r.sort((a, b) => b.discount - a.discount);
    return r;
  }, [q, cats, min, max, stock, sort, k]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const reset = <T,>(f: (v: T) => void) => (v: T) => { f(v); setPage(1); };
  const box = 'flex items-center gap-2 py-1';

  return (
    <main className='mx-auto max-w-7xl px-4 py-4'>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
        <h1 className='font-bold'>{list.length} produits{q ? ' pour « ' + q + ' »' : ''}</h1>
        <div className='flex gap-2'>
          <button onClick={() => setShowF(!showF)} className='rounded border border-ink px-3 py-2 md:hidden'>Filtres</button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label='Trier' className='rounded border border-ink bg-paper px-3 py-2'>
            <option value='rel'>Pertinence</option><option value='asc'>Prix croissant</option><option value='desc'>Prix décroissant</option><option value='rate'>Mieux notés</option><option value='disc'>Plus grosses remises</option>
          </select>
        </div>
      </div>
      <div className='md:grid md:grid-cols-[240px_1fr] md:gap-5'>
        <aside className={(showF ? 'block' : 'hidden') + ' mb-4 self-start rounded border border-neutral-200 p-3.5 md:block'}>
          <h2 className='mb-2 text-sm font-bold'>Catégories</h2>
          {CATEGORIES.map((c) => (<label key={c} className={box}><input type='checkbox' className='accent-black' checked={cats.includes(c)} onChange={(e) => { setCats(e.target.checked ? [...cats, c] : cats.filter((x) => x !== c)); setPage(1); }} />{c}</label>))}
          <h2 className='mb-2 mt-4 text-sm font-bold'>Prix ({currency})</h2>
          <div className='flex gap-1.5'>
            <input type='number' min={0} placeholder='Min' value={min} onChange={(e) => reset(setMin)(e.target.value)} className='w-full rounded border border-neutral-400 p-2' />
            <input type='number' min={0} placeholder='Max' value={max} onChange={(e) => reset(setMax)(e.target.value)} className='w-full rounded border border-neutral-400 p-2' />
          </div>
          <h2 className='mb-2 mt-4 text-sm font-bold'>Disponibilité</h2>
          <label className={box}><input type='checkbox' className='accent-black' checked={stock} onChange={(e) => reset(setStock)(e.target.checked)} />En stock uniquement</label>
        </aside>
        <div>
          {list.length === 0 ? (<div className='border border-dashed border-neutral-400 p-10 text-center'>Aucun produit trouvé. Modifiez vos filtres ou votre recherche.</div>) : (
            <div className='grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-4'>{list.slice((cur - 1) * PER, cur * PER).map((p) => (<ProductCard key={p.id} p={p} />))}</div>
          )}
          <nav aria-label='Pagination' className='my-6 flex flex-wrap justify-center gap-1.5'>
            {Array.from({ length: pages }, (_, i) => (<button key={i} onClick={() => { setPage(i + 1); window.scrollTo(0, 0); }} aria-current={cur === i + 1} className={'h-10 min-w-10 rounded border border-ink ' + (cur === i + 1 ? 'bg-ink text-paper' : '')}>{i + 1}</button>))}
          </nav>
        </div>
      </div>
    </main>
  );
}
