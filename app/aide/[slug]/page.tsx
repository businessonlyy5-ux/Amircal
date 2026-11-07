import { notFound } from 'next/navigation';
import HelpPage from '@/components/HelpPage';
import { HELP, HELP_SLUGS } from '@/lib/help';

export function generateStaticParams() {
  return HELP_SLUGS.map((slug) => ({ slug }));
}

export default async function Aide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in HELP)) notFound();
  return <HelpPage slug={slug} />;
}
