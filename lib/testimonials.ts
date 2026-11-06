import { cache } from 'react';
import { sbPublic } from './supabase/public';

export type Testimonial = { id: string; name: string; rating: number; body: string; photo: string | null; verified: boolean };

type Row = { id: string; product_supplier_id: string | null; category_slug: string | null; author_name: string; rating: number; body: string; photo_path: string | null; verified_purchase: boolean };

// Avis publiés pour un produit : d’abord ceux du produit, puis ceux de sa catégorie, puis les avis généraux. 4 au maximum.
// Les avis ne viennent que de la table testimonials (contenu réel saisi par le propriétaire).
export const getTestimonials = cache(async (productId: number, categorySlug?: string): Promise<Testimonial[]> => {
  try {
    const filters = ['product_supplier_id.eq.' + productId, 'and(product_supplier_id.is.null,category_slug.is.null)'];
    if (categorySlug) filters.push('and(product_supplier_id.is.null,category_slug.eq.' + categorySlug.replace(/[^a-z0-9-]/gi, '') + ')');
    const { data } = await sbPublic().from('testimonials').select('id,product_supplier_id,category_slug,author_name,rating,body,photo_path,verified_purchase').eq('is_published', true).or(filters.join(',')).limit(40);
    const rows = (data ?? []) as unknown as Row[];
    const score = (r: Row) => (r.product_supplier_id ? 0 : r.category_slug ? 1 : 2);
    return rows.sort((a, b) => score(a) - score(b)).slice(0, 4).map((r) => ({ id: r.id, name: r.author_name, rating: r.rating, body: r.body, photo: r.photo_path, verified: r.verified_purchase }));
  } catch {
    return [];
  }
});
