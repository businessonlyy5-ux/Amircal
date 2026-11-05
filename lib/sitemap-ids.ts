import { sbPublic } from './supabase/public';

// Supabase renvoie 1 000 lignes au maximum par requête : on lit donc les identifiants par tranches.
// Un sitemap est limité à 50 000 URLs ; on s’arrête à 45 000 produits.
const PAGE = 1000;
const CAP = 45000;

export async function allProductIds(): Promise<string[]> {
  const db = sbPublic();
  const ids: string[] = [];
  for (let from = 0; from < CAP; from += PAGE) {
    const { data, error } = await db
      .from('products')
      .select('supplier_product_id')
      .eq('is_active', true)
      .not('supplier_product_id', 'is', null)
      .order('id')
      .range(from, from + PAGE - 1);
    if (error) break;
    const rows = (data ?? []) as { supplier_product_id: string }[];
    rows.forEach((r) => ids.push(r.supplier_product_id));
    if (rows.length < PAGE) break;
  }
  return ids;
}
