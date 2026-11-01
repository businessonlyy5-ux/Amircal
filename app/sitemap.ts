import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: base + '/products', changeFrequency: 'daily', priority: 0.9 },
    ...PRODUCTS.map((p) => ({ url: base + '/products/' + p.id, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
