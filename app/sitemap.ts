import type { MetadataRoute } from 'next';
import { sitemapIds } from '@/lib/products';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  let ids: string[] = [];
  try { ids = await sitemapIds(); } catch { /* base inaccessible : sitemap minimal */ }
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: base + '/products', changeFrequency: 'daily', priority: 0.9 },
    ...ids.map((id) => ({ url: base + '/products/' + id, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
