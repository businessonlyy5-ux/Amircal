import Link from 'next/link';
import { getCategories, getSubcategories } from '@/lib/categories';
import { listProducts } from '@/lib/products';
import CatName from '@/components/CatName';
import ProductCard from '@/components/ProductCard';

export const metadata = { title: 'Catalogue', description: 'Tous les produits AMIRCAL : filtrez par catégorie, sous-catégorie et prix.' };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const chipCls = (on: boolean) => 'flex-none whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm ' + (on ? 'border-ink bg-ink text-paper' : 'border-neutral-400');

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const cats = await getCategories();
  const q = one(sp.q) ?? '';
  const catParam = one(sp.cat) ?? '';
  const current = cats.find((c) => c.slug === catParam || c.name === catParam); // le nom reste accepté (anciens liens)
  const cat = current?.slug ?? catParam;
  const subs = current ? await getSubcategories(current.slug) : [];
  const currentSub = subs.find((s) => s.slug === (one(sp.sub) ?? ''));
  const sub = currentSub?.slug ?? '';
  const sort = one(sp.sort) ?? 'rel';
  const minS = one(sp.min) ?? '';
  const maxS = one(sp.max) ?? '';
  const res = await listProducts({ q, cat: cat || undefined, sub: sub || undefined, min: Number(minS) || undefined, max: Number(maxS) || undefined, sort, page: Number(one(sp.page)) || 1, per: 24 });

  const href = (over: Record<string, string | number | undefined>) => {
    const cur: Record<string, string | number | undefined> = { q, cat, sub, sort, min: minS, max: maxS, page: 1, ...over };
    const p = new URLSearchParams();
    Object.entries(cur).forEach(([k, v]) => { if (v !== undefined && v !== '' && !(k === 'page' && v === 1) && !(k === 'sort' && v === 'rel')) p.set(k, String(v)); });
    const s = p.toString();
    return '/products' + (s ? '?' + s : '');
  };

  const filters = (
    <form method='get' action='/products' className='space-y-4 text-sm'>
      {q && <input type='hidden' name='q' value={q} />}
      <div>
        <h2 className='mb-2 font-bold'>Catégories</h2>
        <ul className='space-y-1'>
          <li><Link href={href({ cat: '', sub: '' })} className={!cat ? 'font-bold underline' : ''}>Toutes</Link></li>
          {cats.map((c) => (
            <li key={c.slug}>
              <Link href={href({ cat: c.slug, sub: '' })} className={cat === c.slug ? 'font-bold underline' : ''}><CatName c={c} /></Link>
              {cat === c.slug && subs.length > 0 && (
                <ul className='ml-3 mt-1 space-y-1 border-l border-neutral-300 pl-3'>
                  {subs.map((s) => (<li key={s.slug}><Link href={href({ sub: s.slug })} className={sub === s.slug ? 'font-bold underline' : ''}><CatName c={s} /></Link></li>))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        {cat && <input type='hidden' name='cat' value={cat} />}
        {sub && <input type='hidden' name='sub' value={sub} />}
      </div>
      <div>
        <h2 className='mb-2 font-bold'>Prix (USD)</h2>
        <div className='flex gap-1.5'>
          <input name='min' type='number' min={0} placeholder='Min' defaultValue={minS} className='w-full rounded border border-neutral-400 p-2' />
          <input name='max' type='number' min={0} placeholder='Max' defaultValue={maxS} className='w-full rounded border border-neutral-400 p-2' />
        </div>
      </div>
      <div>
        <h2 className='mb-2 font-bold'>Trier par</h2>
        <select name='sort' defaultValue={sort} className='w-full rounded border border-ink bg-paper p-2'>
          <option value='rel'>Nouveautés</option><option value='asc'>Prix croissant</option><option value='desc'>Prix décroissant</option>
        </select>
      </div>
      <button className='w-full rounded bg-ink py-2.5 font-bold text-paper'>Appliquer</button>
    </form>
  );

  const pages: number[] = [];
  for (let i = Math.max(1, res.page - 2); i <= Math.min(res.pages, res.page + 2); i++) pages.push(i);

  return (
    <main className='mx-auto max-w-7xl px-4 py-4'>
      <h1 className='mb-3 font-bold'>{res.total.toLocaleString('fr-FR')} produits{current ? ' · ' : ''}{current ? <CatName c={current} /> : null}{currentSub ? <> › <CatName c={currentSub} /></> : null}{q ? ' pour « ' + q + ' »' : ''}</h1>
      <details className='mb-4 rounded border border-neutral-300 p-3 md:hidden'><summary className='cursor-pointer font-bold'>Filtres et tri</summary><div className='mt-3'>{filters}</div></details>
      <div className='md:grid md:grid-cols-[240px_1fr] md:gap-5'>
        <aside className='hidden self-start rounded border border-neutral-200 p-3.5 md:block'>{filters}</aside>
        <div>
          {subs.length > 0 && (
            <nav aria-label='Sous-catégories' className='-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1'>
              <Link href={href({ sub: '' })} aria-current={!sub} className={chipCls(!sub)}>Tout</Link>
              {subs.map((s) => (<Link key={s.slug} href={href({ sub: s.slug })} aria-current={sub === s.slug} className={chipCls(sub === s.slug)}><CatName c={s} /></Link>))}
            </nav>
          )}
          {res.items.length === 0 ? (<div className='border border-dashed border-neutral-400 p-10 text-center'>Aucun produit trouvé. Modifiez vos filtres ou votre recherche.</div>) : (
            <div className='grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-4'>{res.items.map((p) => (<ProductCard key={p.id} p={p} />))}</div>
          )}
          {res.pages > 1 && (
            <nav aria-label='Pagination' className='my-6 flex flex-wrap items-center justify-center gap-1.5'>
              {res.page > 1 && <Link href={href({ page: res.page - 1 })} className='flex h-10 items-center rounded border border-ink px-3'>‹ Précédent</Link>}
              {pages[0] > 1 && <Link href={href({ page: 1 })} className='grid h-10 min-w-10 place-items-center rounded border border-ink'>1</Link>}
              {pages.map((n) => (<Link key={n} href={href({ page: n })} aria-current={n === res.page} className='grid h-10 min-w-10 place-items-center rounded border border-ink'>{n}</Link>))}
              {pages[pages.length - 1] < res.pages && <Link href={href({ page: res.pages })} className='grid h-10 min-w-10 place-items-center rounded border border-ink'>{res.pages}</Link>}
              {res.page < res.pages && <Link href={href({ page: res.page + 1 })} className='flex h-10 items-center rounded border border-ink px-3'>Suivant ›</Link>}
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}
