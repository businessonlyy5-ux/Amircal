import type { MetadataRoute } from 'next';
import { getCategories } from '@/lib/categories';
import { allProductIds } from '@/lib/sitemap-ids';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  let ids: string[] = [];
  let cats: { slug: string }[] = [];
  try { ids = await allProductIds(); } catch { /* base inaccessible : sitemap minimal */ }
  try { cats = await getCategories(); } catch { /* idem */ }
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: base + '/products', changeFrequency: 'daily', priority: 0.9 },
    ...cats.map((c) => ({ url: base + '/products?cat=' + c.slug, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...ids.map((id) => ({ url: base + '/products/' + id, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
