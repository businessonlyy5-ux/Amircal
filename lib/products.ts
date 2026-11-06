import { cache } from 'react';
import { sbPublic } from './supabase/public';
import { MARGIN, type Product } from './data';

const SEL = 'id,supplier_product_id,title,description,base_price_usd,categories(name),product_images(url,sort_order)';
type Row = {
  id: string; supplier_product_id: string | null; title: string; description: string | null; base_price_usd: number | string;
  categories: { name: string } | { name: string }[] | null; product_images: { url: string; sort_order: number }[] | null;
};

function toProduct(r: Row): Product {
  const cat = Array.isArray(r.categories) ? r.categories[0]?.name : r.categories?.name;
  const imgs = [...(r.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url);
  return {
    id: Number(r.supplier_product_id), name: r.title, category: cat ?? '',
    price: Math.round(Number(r.base_price_usd) * MARGIN * 100) / 100,
    compareAt: 0, discount: 0, rating: 0, stock: 25, // stock réel : à synchroniser plus tard
    image: imgs[0], images: imgs, description: r.description ?? undefined,
  };
}
const valid = (p: Product) => Number.isFinite(p.id) && p.id > 0;
const clean = (s: string) => s.replace(/[%_,()\\*]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);

// Une catégorie se désigne par son slug (ex. electronique) ; l’ancien format par nom reste accepté.
async function categoryId(value: string) {
  const db = sbPublic();
  const bySlug = await db.from('categories').select('id').eq('slug', value).eq('is_active', true).limit(1);
  const a = ((bySlug.data ?? []) as { id: string }[])[0]?.id;
  if (a) return a;
  const byName = await db.from('categories').select('id').eq('name', value).eq('is_active', true).limit(1);
  return ((byName.data ?? []) as { id: string }[])[0]?.id ?? null;
}

// cat : une catégorie ; cats : plusieurs catégories (collections). Prix min/max en USD affichés.
export type ListOpts = { q?: string; cat?: string; cats?: string[]; min?: number; max?: number; sort?: string; page?: number; per?: number };
export type ListResult = { items: Product[]; total: number; pages: number; page: number };

export async function listProducts(o: ListOpts): Promise<ListResult> {
  const per = o.per ?? 24;
  const page = Math.max(1, Math.floor(o.page ?? 1));
  const empty = { items: [], total: 0, pages: 1, page: 1 };
  const catId = o.cat ? await categoryId(o.cat) : null;
  if (o.cat && !catId) return empty;
  const multi = !o.cat && o.cats?.length ? ((await Promise.all(o.cats.map(categoryId))).filter(Boolean) as string[]) : [];
  if (!o.cat && o.cats?.length && multi.length === 0) return empty;
  let f = sbPublic().from('products').select(SEL, { count: 'exact' }).eq('is_active', true).not('supplier_product_id', 'is', null);
  if (catId) f = f.eq('category_id', catId);
  else if (multi.length) f = f.in('category_id', multi);
  const term = o.q ? clean(o.q) : '';
  if (term) f = f.ilike('title', '%' + term + '%');
  if (o.min && o.min > 0) f = f.gte('base_price_usd', o.min / MARGIN);
  if (o.max && o.max > 0) f = f.lte('base_price_usd', o.max / MARGIN);
  const sorted = o.sort === 'asc' ? f.order('base_price_usd', { ascending: true }) : o.sort === 'desc' ? f.order('base_price_usd', { ascending: false }) : f.order('created_at', { ascending: false });
  const from = (page - 1) * per;
  const { data, count, error } = await sorted.order('id').range(from, from + per - 1);
  if (error) return empty;
  const total = count ?? 0;
  return { items: ((data ?? []) as unknown as Row[]).map(toProduct).filter(valid), total, pages: Math.max(1, Math.ceil(total / per)), page };
}

export const getProduct = cache(async (id: number): Promise<Product | null> => {
  if (!Number.isInteger(id) || id <= 0) return null;
  const { data } = await sbPublic().from('products').select(SEL).eq('supplier', 'zendrop').eq('supplier_product_id', String(id)).eq('is_active', true).limit(1);
  const r = ((data ?? []) as unknown as Row[])[0];
  return r ? toProduct(r) : null;
});

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  const list = [...new Set(ids.filter((i) => Number.isInteger(i) && i > 0))].slice(0, 40);
  if (!list.length) return [];
  const { data } = await sbPublic().from('products').select(SEL).eq('supplier', 'zendrop').eq('is_active', true).in('supplier_product_id', list.map(String));
  return ((data ?? []) as unknown as Row[]).map(toProduct).filter(valid);
}

export async function related(p: Product, n = 8): Promise<Product[]> {
  const same = (await listProducts({ cat: p.category, per: n + 1 })).items.filter((x) => x.id !== p.id).slice(0, n);
  if (same.length >= n) return same;
  const more = (await listProducts({ per: n + 1 })).items.filter((x) => x.id !== p.id && !same.some((s) => s.id === x.id));
  return [...same, ...more].slice(0, n);
}

export async function sitemapIds(): Promise<string[]> {
  const { data } = await sbPublic().from('products').select('supplier_product_id').eq('is_active', true).not('supplier_product_id', 'is', null).limit(5000);
  return ((data ?? []) as { supplier_product_id: string }[]).map((r) => r.supplier_product_id);
}
