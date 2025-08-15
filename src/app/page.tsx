import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LatestNewsSection } from '@/features/news/components/LatestNewsSection';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container-responsive flex-1 py-6">
        <LatestNewsSection />
      </main>
      <Footer />
    </div>
  );
}


