import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { Slide } from '@/components/HeroCarousel';

// Bannières du carrousel : fichiers déposés dans public/hero/ (voir public/hero/README.md).
// Deux façons de choisir l’image de chaque slide :
//   1. dans hero.json : "src" (ordinateur) et "mobile" (facultatif) = nom exact du fichier, quel qu’il soit ;
//   2. ou en nommant le fichier hero-1.jpg, hero-1-mobile.jpg, hero-2.jpg… (utilisé si "src" est absent).
// Les liens et textes alternatifs se règlent aussi dans public/hero/hero.json (même ordre que les slides).
type Meta = { href?: string; alt?: string; src?: string; mobile?: string };

export function heroSlides(): Slide[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'hero');
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir);
    let meta: Meta[] = [];
    try { meta = JSON.parse(readFileSync(path.join(dir, 'hero.json'), 'utf8')) as Meta[]; } catch { /* hero.json absent ou invalide */ }
    const named = (f?: string) => (f && files.includes(f) ? f : undefined);
    const out: Slide[] = [];
    for (let n = 1; n <= 8; n++) {
      const m = meta[n - 1] ?? {};
      const desktop = named(m.src) ?? files.find((f) => new RegExp('^hero-' + n + '\\.(jpe?g|png|webp|avif)$', 'i').test(f));
      if (!desktop) continue;
      const mobile = named(m.mobile) ?? files.find((f) => new RegExp('^hero-' + n + '-mobile\\.(jpe?g|png|webp|avif)$', 'i').test(f));
      out.push({ images: [], banner: { desktop: '/hero/' + encodeURIComponent(desktop), mobile: mobile ? '/hero/' + encodeURIComponent(mobile) : undefined, href: m.href ?? '/products', alt: m.alt ?? 'AMIRCAL' } });
    }
    return out;
  } catch {
    return [];
  }
}
