import { cache } from 'react';
import { sbPublic } from './supabase/public';

export type Cat = { slug: string; name: string; nameEn: string | null };

// Catégories actives, dans l’ordre défini en base (sort_order). Ajouter ou désactiver une catégorie dans Supabase suffit.
export const getCategories = cache(async (): Promise<Cat[]> => {
  const { data } = await sbPublic().from('categories').select('slug,name,name_en').eq('is_active', true).order('sort_order');
  return ((data ?? []) as { slug: string; name: string; name_en: string | null }[]).map((c) => ({ slug: c.slug, name: c.name, nameEn: c.name_en }));
});
