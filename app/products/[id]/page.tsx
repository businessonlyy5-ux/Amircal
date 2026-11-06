import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';
import { getProduct, related } from '@/lib/products';

export const revalidate = 300;
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct(Number((await params).id));
  if (!p) return {};
  const d = (p.description ?? p.name).replace(/\s+/g, ' ').slice(0, 155);
  return { title: p.name, description: d, openGraph: { title: p.name, description: d, images: p.image ? [p.image] : undefined } };
}

export default async function Page({ params }: Props) {
  const p = await getProduct(Number((await params).id));
  if (!p) notFound();
  const rel = await related(p, 8);
  // key : repart de zéro (image, quantité, variante choisie) quand on passe d'un produit à un autre.
  return <ProductDetail key={p.id} p={p} related={rel} />;
}
