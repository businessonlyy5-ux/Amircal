import { cache } from 'react';
import { sbPublic } from './supabase/public';

export type Testimonial = { id: string; name: string; rating: number; body: string; photo: string | null; verified: boolean; sample: boolean };

type Row = { id: string; product_supplier_id: string | null; category_slug: string | null; author_name: string; rating: number; body: string; photo_path: string | null; verified_purchase: boolean; is_sample: boolean };

function rotate<T>(a: T[], k: number): T[] {
  if (!a.length) return a;
  const n = k % a.length;
  return a.slice(n).concat(a.slice(0, n));
}

// Avis publiés pour un produit : d’abord ceux du produit, puis ceux de sa catégorie, puis les avis généraux. 4 au maximum.
// Les avis marqués is_sample = true sont des avis d’exemple pour les démonstrations (jamais « achat vérifié », signalés sur la fiche).
// Pour les masquer avant l’ouverture : variable HIDE_SAMPLE_REVIEWS=1 sur Render (ou supprimer les lignes is_sample de la table).
export const getTestimonials = cache(async (productId: number, categorySlug?: string): Promise<Testimonial[]> => {
  try {
    const filters = ['product_supplier_id.eq.' + productId, 'and(product_supplier_id.is.null,category_slug.is.null)'];
    if (categorySlug) filters.push('and(product_supplier_id.is.null,category_slug.eq.' + categorySlug.replace(/[^a-z0-9-]/gi, '') + ')');
    let q = sbPublic().from('testimonials').select('id,product_supplier_id,category_slug,author_name,rating,body,photo_path,verified_purchase,is_sample').eq('is_published', true).or(filters.join(',')).limit(60);
    if (process.env.HIDE_SAMPLE_REVIEWS === '1') q = q.eq('is_sample', false);
    const { data } = await q;
    const rows = (data ?? []) as unknown as Row[];
    const score = (r: Row) => (r.product_supplier_id ? 0 : r.category_slug ? 1 : 2);
    // Dans chaque groupe, on change de point de départ selon le produit pour que deux fiches voisines n’affichent pas les mêmes avis.
    const groups = [0, 1, 2].map((s) => rotate(rows.filter((r) => score(r) === s).sort((a, b) => a.id.localeCompare(b.id)), productId));
    return groups.flat().slice(0, 4).map((r) => ({ id: r.id, name: r.author_name, rating: r.rating, body: r.body, photo: r.photo_path, verified: r.verified_purchase, sample: r.is_sample }));
  } catch {
    return [];
  }
});
