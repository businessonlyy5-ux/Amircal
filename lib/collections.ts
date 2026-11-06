import { cache } from 'react';
import { sbPublic } from './supabase/public';
import type { Cat } from './categories';

// Une collection a la forme d’une catégorie (slug, noms FR/EN, image) plus un filtre et une description.
export type Collection = Cat & { description: string | null; filter: { cats?: string[]; q?: string | null; maxPrice?: number } };

type Row = { slug: string; name: string; name_en: string | null; description: string | null; image_url: string | null; filter: { cats?: string[]; q?: string | null; max_price?: number } | null };
const map = (r: Row): Collection => ({ slug: r.slug, name: r.name, nameEn: r.name_en, image: r.image_url, description: r.description, filter: { cats: r.filter?.cats, q: r.filter?.q, maxPrice: r.filter?.max_price } });
const SEL = 'slug,name,name_en,description,image_url,filter';

// Collections actives, dans l’ordre de sort_order : modifiables dans Supabase (table collections).
export const getCollections = cache(async (): Promise<Collection[]> => {
  const { data } = await sbPublic().from('collections').select(SEL).eq('is_active', true).order('sort_order');
  return ((data ?? []) as unknown as Row[]).map(map);
});

export const getCollection = cache(async (slug: string): Promise<Collection | null> => {
  const { data } = await sbPublic().from('collections').select(SEL).eq('slug', slug).eq('is_active', true).limit(1);
  const r = ((data ?? []) as unknown as Row[])[0];
  return r ? map(r) : null;
});
