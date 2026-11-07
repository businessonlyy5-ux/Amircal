'use client';
import Link from 'next/link';
import { useStore } from './Store';
import { HELP, HELP_SLUGS } from '@/lib/help';

export default function HelpPage({ slug }: { slug: string }) {
  const { lang } = useStore();
  const en = lang === 'en';
  const d = HELP[slug][en ? 'en' : 'fr'];
  return (
    <main className='mx-auto max-w-3xl px-4 py-8'>
      <p className='mb-3 text-xs text-neutral-600'><Link href='/' className='underline'>{en ? 'Home' : 'Accueil'}</Link> / {d.title}</p>
      <h1 className='mb-2 text-3xl font-extrabold'>{d.title}</h1>
      <p className='mb-6 text-graphite'>{d.intro}</p>
      <div className='space-y-6'>
        {d.sections.map((s) => (
          <section key={s.h} id={s.id}>
            <h2 className='mb-1 text-lg font-bold'>{s.h}</h2>
            <p className='text-sm leading-relaxed text-graphite'>{s.p}</p>
          </section>
        ))}
      </div>
      <nav className='mt-8 flex flex-wrap gap-2 border-t border-neutral-200 pt-4 text-sm'>
        {HELP_SLUGS.filter((x) => x !== slug).map((x) => (
          <Link key={x} href={'/aide/' + x} className='rounded border border-ink px-4 py-2 font-medium hover:bg-ink hover:text-paper'>{HELP[x][en ? 'en' : 'fr'].title}</Link>
        ))}
      </nav>
    </main>
  );
}
