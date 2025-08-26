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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          </div>
        }>
          <InstagramPreview news={news} />
        </Suspense>
        
        {/* Instructions */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>💡 Pentru cel mai bun rezultat:</p>
          <ul className="mt-2 space-y-1">
            <li>• Fă screenshot pe telefon în orientare portrait</li>
            <li>• Asigură-te că imaginea este centrată</li>
            <li>• Folosește funcția de crop din Instagram</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
