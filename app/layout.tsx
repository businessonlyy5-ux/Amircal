import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'AMIRCAL — Marketplace', template: '%s | AMIRCAL' },
  description: 'Marketplace internationale : électronique, maison, mode, beauté et plus. Livraison aux États-Unis et en Haïti.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="bg-ink text-paper">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-extrabold tracking-[.14em]">AMIRCAL</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/login">Connexion</Link>
              <Link href="/account">Mon compte</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
