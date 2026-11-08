import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Photos déposées dans public/categories/ et public/collections/ : le nom du fichier est le slug
// (ex. public/categories/sports-plein-air.jpg). Elles remplacent l’image de la base sur la page d’accueil.
function scan(folder: string): Record<string, string> {
  try {
    const dir = path.join(process.cwd(), 'public', folder);
    if (!existsSync(dir)) return {};
    const out: Record<string, string> = {};
    for (const f of readdirSync(dir)) {
      const m = /^(.+)\.(jpe?g|png|webp|avif)$/i.exec(f);
      if (m) out[m[1].toLowerCase()] = '/' + folder + '/' + f;
    }
    return out;
  } catch {
    return {};
  }
}

export const categoryPhotos = () => scan('categories');
export const collectionPhotos = () => scan('collections');
