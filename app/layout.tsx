import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/Store';
import RateInit from '@/components/RateInit';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategories } from '@/lib/categories';
import { getRate } from '@/lib/rate';

export const revalidate = 300;
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'AMIRCAL — Online store', template: '%s | AMIRCAL' },
  description: 'Electronics, home, fashion, beauty and more. Delivery across the United States in 3 to 5 days.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, rate] = await Promise.all([getCategories(), getRate()]);
  return (
    <html lang='fr'>
      <body>
        <RateInit rate={rate} />
        <StoreProvider>
          <AnnouncementBar />
          <Header categories={categories} />
          {children}
          <Footer categories={categories} />
        </StoreProvider>
      </body>
    </html>
  );
}
