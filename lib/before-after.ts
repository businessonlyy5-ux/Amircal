import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Photos « avant / après » déposées dans public/avant-apres/ (voir le README de ce dossier).
// Nom des fichiers : <id produit>-avant.jpg et <id produit>-apres.jpg (jpg, png, webp ou avif).
export type BeforeAfterImages = { before: string; after: string };

export function beforeAfter(id: number): BeforeAfterImages | null {
  try {
    const dir = path.join(process.cwd(), 'public', 'avant-apres');
    if (!existsSync(dir)) return null;
    const files = readdirSync(dir);
    const find = (kind: string) => files.find((f) => new RegExp('^' + id + '-' + kind + '\\.(jpe?g|png|webp|avif)$', 'i').test(f));
    const b = find('avant');
    const a = find('apres');
    return b && a ? { before: '/avant-apres/' + b, after: '/avant-apres/' + a } : null;
  } catch {
    return null;
  }
}
