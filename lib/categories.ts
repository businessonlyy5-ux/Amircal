import { cache } from 'react';
import { sbPublic } from './supabase/public';

export type Cat = { slug: string; name: string; nameEn: string | null; image: string | null };

// Catégories actives, dans l’ordre défini en base (sort_order). Ajouter ou désactiver une catégorie dans Supabase suffit.
// L’image (image_url) est modifiable en base.
export const getCategories = cache(async (): Promise<Cat[]> => {
  const { data } = await sbPublic().from('categories').select('slug,name,name_en,image_url').eq('is_active', true).order('sort_order');
  return ((data ?? []) as { slug: string; name: string; name_en: string | null; image_url: string | null }[]).map((c) => ({ slug: c.slug, name: c.name, nameEn: c.name_en, image: c.image_url }));
});

// Sous-catégories actives d’une catégorie (table subcategories), même forme que Cat pour réutiliser <CatName />.
export const getSubcategories = cache(async (catSlug: string): Promise<Cat[]> => {
  if (!catSlug) return [];
  const db = sbPublic();
  const { data: cat } = await db.from('categories').select('id').eq('slug', catSlug).eq('is_active', true).limit(1);
  const id = ((cat ?? []) as { id: string }[])[0]?.id;
  if (!id) return [];
  const { data } = await db.from('subcategories').select('slug,name,name_en').eq('category_id', id).eq('is_active', true).order('sort_order');
  return ((data ?? []) as { slug: string; name: string; name_en: string | null }[]).map((s) => ({ slug: s.slug, name: s.name, nameEn: s.name_en, image: null }));
});
