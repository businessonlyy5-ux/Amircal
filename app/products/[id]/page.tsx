import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { getCategories } from '@/lib/categories';
import { beforeAfter } from '@/lib/before-after';
import { parseDescription } from '@/lib/details';
import { getProduct, related } from '@/lib/products';
import { demoStockOn } from '@/lib/stock';
import { getTestimonials } from '@/lib/testimonials';
import { complements } from '@/lib/upsell';

export const revalidate = 300;
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct(Number((await params).id));
  if (!p) return {};
  const d = (parseDescription(p.description, p.name).paragraphs[0] ?? p.name).replace(/\s+/g, ' ').slice(0, 155);
  return { title: p.name, description: d, openGraph: { title: p.name, description: d, images: p.image ? [p.image] : undefined } };
}

export default async function Page({ params }: Props) {
  const p = await getProduct(Number((await params).id));
  if (!p) notFound();
  const [rel, cats, up] = await Promise.all([related(p, 8), getCategories(), complements(p, 3)]);
  const slug = cats.find((c) => c.name === p.category)?.slug;
  const reviews = await getTestimonials(p.id, slug);
  const summary = reviews.length ? { avg: Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10, count: reviews.length, sample: reviews.every((r) => r.sample) } : undefined;
  // key : repart de zéro (image, quantité, variante choisie) quand on passe d’un produit à un autre.
  return <ProductDetail key={p.id} p={p} related={rel} upsell={up} beforeAfter={beforeAfter(p.id)} demoStock={demoStockOn()} summary={summary} reviews={reviews.length ? <TestimonialCarousel items={reviews} /> : undefined} />;
}
