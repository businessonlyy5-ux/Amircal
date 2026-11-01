import { Suspense } from 'react';
import Catalog from '@/components/Catalog';

export const metadata = { title: 'Catalogue', description: 'Tous les produits AMIRCAL : filtrez par catégorie, prix et disponibilité.' };

export default function ProductsPage() {
  return (<Suspense fallback={<main className='p-8'>Chargement…</main>}><Catalog /></Suspense>);
}
