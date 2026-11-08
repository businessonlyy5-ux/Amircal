import { cache } from 'react';
import { sbPublic } from './supabase/public';
import { MARGIN, type Product } from './data';

// sell_price_usd : prix habituel calculé en base (grille par tranche de coût) ; sale_percent : remise proposée, appliquée seulement si la vente est activée (site_settings, clé « sale »).
const SEL = 'id,supplier_product_id,title,description,base_price_usd,sell_price_usd,sale_percent,categories(name),product_images(url,sort_order)';
// La fiche produit charge aussi les variantes Zendrop (couleur, taille…) avec leur prix.
const SEL_DETAIL = SEL + ',product_variants(options,price_usd,is_active)';
type Row = {
  id: string; supplier_product_id: string | null; title: string; description: string | null; base_price_usd: number | string;
  sell_price_usd: number | string | null; sale_percent: number | string | null;
  categories: { name: string } | { name: string }[] | null; product_images: { url: string; sort_order: number }[] | null;
  product_variants?: { options: Record<string, unknown> | null; price_usd: number | string; is_active: boolean }[] | null;
};

// Vente en cours ? Désactivée par défaut : aucun prix barré tant qu’elle n’est pas activée (et elle s’arrête seule à ends_at).
type SaleCfg = { enabled?: boolean; label?: string; label_en?: string; ends_at?: string | null };
export const getSale = cache(async (): Promise<SaleCfg | null> => {
  try {
    const { data } = await sbPublic().from('site_settings').select('value').eq('key', 'sale').limit(1);
    const v = ((data ?? []) as { value: SaleCfg }[])[0]?.value;
    if (!v?.enabled) return null;
    if (v.ends_at && new Date(v.ends_at).getTime() < Date.now()) return null;
    return v;
  } catch {
    return null;
  }
});

// Titres fournisseurs : on retire les parenthèses de spécifications techniques (« (as1, alpha, one_size, …) »),
// un fragment de parenthèse coupé en fin de titre et la ponctuation orpheline. Le titre en base n’est pas modifié.
const tidy = (t: string) => t
  .replace(/\s*\((?:[^()]*,){2,}[^()]*\)/g, '')
  .replace(/\s*\([^)]*$/, '')
  .replace(/\s*[-–,;:|]+\s*$/, '')
  .replace(/\s{2,}/g, ' ')
  .trim() || t;

function toProduct(r: Row, saleOn: boolean): Product {
  const cat = Array.isArray(r.categories) ? r.categories[0]?.name : r.categories?.name;
  const imgs = [...(r.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url);
  const base = Number(r.base_price_usd);
  // Le panier facture le prix du produit : on ne propose donc que les variantes au même prix (ou moins cher) que lui.
  // Les variantes plus chères (lot de 2, lot de 30…) seront proposées quand le panier gèrera un prix par variante.
  const variants = (r.product_variants ?? [])
    .filter((v) => v.is_active && v.options && typeof v.options === 'object' && Object.keys(v.options).length > 0 && Number(v.price_usd) <= base + 0.005)
    .map((v) => {
      const options = Object.fromEntries(Object.entries(v.options ?? {}).map(([k, x]) => [k, String(x)]));
      return { options, label: Object.values(options).join(' / ') };
    });

  // Prix habituel (grille de prix en base) ; repli sur l’ancien calcul si absent.
  const regular = r.sell_price_usd != null ? Number(r.sell_price_usd) : Math.round(base * MARGIN * 100) / 100;
  const pct = saleOn ? Number(r.sale_percent ?? 0) : 0;
  let price = regular, compareAt = 0, discount = 0;
  if (pct > 0) {
    const sale = Math.ceil(regular * (1 - pct / 100)) - 0.01; // arrondi vers le haut, terminé en .99 : la marge est préservée
    if (sale > 0 && sale < regular) { price = Math.round(sale * 100) / 100; compareAt = regular; discount = Math.round((1 - price / regular) * 100); }
  }
  return {
    id: Number(r.supplier_product_id), name: tidy(r.title), category: cat ?? '',
    price, compareAt, discount, rating: 0, stock: 25, // stock réel : à synchroniser plus tard
    image: imgs[0], images: imgs, description: r.description ?? undefined,
    variants: variants.length ? variants : undefined,
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

// Une sous-catégorie se désigne par son slug, au sein d’une catégorie (table subcategories).
async function subcategoryId(catId: string, slug: string) {
  const { data } = await sbPublic().from('subcategories').select('id').eq('category_id', catId).eq('slug', slug).eq('is_active', true).limit(1);
  return ((data ?? []) as { id: string }[])[0]?.id ?? null;
}

// cat : une catégorie ; sub : une sous-catégorie de cette catégorie ; cats : plusieurs catégories (collections). Prix min/max en USD (prix habituel).
export type ListOpts = { q?: string; cat?: string; sub?: string; cats?: string[]; min?: number; max?: number; sort?: string; page?: number; per?: number };
export type ListResult = { items: Product[]; total: number; pages: number; page: number };

export async function listProducts(o: ListOpts): Promise<ListResult> {
  const per = o.per ?? 24;
  const page = Math.max(1, Math.floor(o.page ?? 1));
  const empty = { items: [], total: 0, pages: 1, page: 1 };
  const catId = o.cat ? await categoryId(o.cat) : null;
  if (o.cat && !catId) return empty;
  const subId = catId && o.sub ? await subcategoryId(catId, o.sub) : null;
  if (o.sub && catId && !subId) return empty;
  const multi = !o.cat && o.cats?.length ? ((await Promise.all(o.cats.map(categoryId))).filter(Boolean) as string[]) : [];
  if (!o.cat && o.cats?.length && multi.length === 0) return empty;
  let f = sbPublic().from('products').select(SEL, { count: 'exact' }).eq('is_active', true).not('supplier_product_id', 'is', null);
  if (catId) f = f.eq('category_id', catId);
  else if (multi.length) f = f.in('category_id', multi);
  if (subId) f = f.eq('subcategory_id', subId);
  const term = o.q ? clean(o.q) : '';
  if (term) f = f.ilike('title', '%' + term + '%');
  if (o.min && o.min > 0) f = f.gte('sell_price_usd', o.min);
  if (o.max && o.max > 0) f = f.lte('sell_price_usd', o.max);
  const sorted = o.sort === 'asc' ? f.order('sell_price_usd', { ascending: true }) : o.sort === 'desc' ? f.order('sell_price_usd', { ascending: false }) : f.order('created_at', { ascending: false });
  const from = (page - 1) * per;
  const [{ data, count, error }, sale] = await Promise.all([sorted.order('id').range(from, from + per - 1), getSale()]);
  if (error) return empty;
  const total = count ?? 0;
  return { items: ((data ?? []) as unknown as Row[]).map((r) => toProduct(r, !!sale)).filter(valid), total, pages: Math.max(1, Math.ceil(total / per)), page };
}

export const getProduct = cache(async (id: number): Promise<Product | null> => {
  if (!Number.isInteger(id) || id <= 0) return null;
  const [{ data }, sale] = await Promise.all([
    sbPublic().from('products').select(SEL_DETAIL).eq('supplier', 'zendrop').eq('supplier_product_id', String(id)).eq('is_active', true).limit(1),
    getSale(),
  ]);
  const r = ((data ?? []) as unknown as Row[])[0];
  return r ? toProduct(r, !!sale) : null;
});

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  const list = [...new Set(ids.filter((i) => Number.isInteger(i) && i > 0))].slice(0, 40);
  if (!list.length) return [];
  const [{ data }, sale] = await Promise.all([
    sbPublic().from('products').select(SEL).eq('supplier', 'zendrop').eq('is_active', true).in('supplier_product_id', list.map(String)),
    getSale(),
  ]);
  return ((data ?? []) as unknown as Row[]).map((r) => toProduct(r, !!sale)).filter(valid);
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
