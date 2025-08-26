import { Metadata } from 'next';
import { Suspense } from 'react';
import { InstagramPreview } from '@/components/admin/InstagramPreview';
import { fetchNewsById } from '@/features/news/services/newsService';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const news = await fetchNewsById(params.id);
  
  if (!news) {
    return {
      title: 'Știre negăsită',
    };
  }

  return {
    title: `${news.title} - Instagram Preview`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function InstagramPreviewPage({ params }: PageProps) {
  const news = await fetchNewsById(params.id);
  
  if (!news) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <Suspense fallback={
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          </div>
        }>
          <InstagramPreview news={news} />
        </Suspense>
        
        {/* Instructions */}
        <div className="mt-6 sm:mt-8 text-center text-gray-600 text-xs sm:text-sm">
          <p>💡 Funcționalități automate:</p>
          <ul className="mt-2 space-y-1">
            <li>• Click pe card pentru screenshot automat</li>
            <li>• Imaginea se salvează direct în galeria telefonului</li>
            <li>• Copiază hashtag-urile cu butonul dedicat</li>
            <li>• Postează direct pe Instagram</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
