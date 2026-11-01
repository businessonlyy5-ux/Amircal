import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/Store';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'AMIRCAL — Marketplace', template: '%s | AMIRCAL' },
  description: 'Marketplace internationale : électronique, maison, mode, beauté et plus. Livraison aux États-Unis et en Haïti.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='fr'>
      <body className='pb-16 md:pb-0'>
        <StoreProvider>
          <Header />
          {children}
          <Footer />
          <MobileNav />
        </StoreProvider>
      </body>
    </html>
  );
}
