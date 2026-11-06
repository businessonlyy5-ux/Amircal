import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { Slide } from '@/components/HeroCarousel';

// Bannières du carrousel : fichiers déposés dans public/hero/ (voir public/hero/README.md).
//   hero-1.jpg         -> version ordinateur du slide 1
//   hero-1-mobile.jpg  -> version mobile (facultative)
// Les liens et textes alternatifs se règlent dans public/hero/hero.json (même ordre que les images).
type Meta = { href?: string; alt?: string };

export function heroSlides(): Slide[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'hero');
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir);
    let meta: Meta[] = [];
    try { meta = JSON.parse(readFileSync(path.join(dir, 'hero.json'), 'utf8')) as Meta[]; } catch { /* hero.json absent ou invalide */ }
    const out: Slide[] = [];
    for (let n = 1; n <= 8; n++) {
      const desktop = files.find((f) => new RegExp('^hero-' + n + '\\.(jpe?g|png|webp|avif)$', 'i').test(f));
      if (!desktop) continue;
      const mobile = files.find((f) => new RegExp('^hero-' + n + '-mobile\\.(jpe?g|png|webp|avif)$', 'i').test(f));
      const m = meta[n - 1] ?? {};
      out.push({ images: [], banner: { desktop: '/hero/' + desktop, mobile: mobile ? '/hero/' + mobile : undefined, href: m.href ?? '/products', alt: m.alt ?? 'AMIRCAL' } });
    }
    return out;
  } catch {
    return [];
  }
}
