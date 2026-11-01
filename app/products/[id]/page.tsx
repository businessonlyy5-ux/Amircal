import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';
import { getProduct, PRODUCTS } from '@/lib/data';

type Props = { params: Promise<{ id: string }> };
export const generateStaticParams = () => PRODUCTS.map((p) => ({ id: String(p.id) }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct(Number((await params).id));
  return p ? { title: p.name, description: p.name + ' — ' + p.category + ' sur AMIRCAL.' } : {};
}

export default async function Page({ params }: Props) {
  const p = getProduct(Number((await params).id));
  if (!p) notFound();
  return <ProductDetail p={p} />;
}
