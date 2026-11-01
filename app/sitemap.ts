import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  // Les produits et catégories actifs seront ajoutés depuis Supabase en Phase 2/4.
  return [{ url: base, changeFrequency: 'daily', priority: 1 }];
}
