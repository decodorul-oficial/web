'use client';

import { useState, useEffect } from 'react';
import { InstagramPreview } from '@/components/admin/InstagramPreview';
import { IOSScreenshotButton } from '@/components/admin/IOSScreenshotButton';
import { fetchNewsById } from '@/features/news/services/newsService';
import { NewsItem } from '@/features/news/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function InstagramPreviewPage({ params }: PageProps) {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await fetchNewsById(params.id);
        if (newsData) {
          setNews(newsData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading news:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Știre negăsită</h1>
          <button
            onClick={() => window.history.back()}
            className="bg-brand hover:bg-brand-accent text-white px-4 py-2 rounded-lg"
          >
            ← Înapoi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md"
           style={{
             /* Mobile optimizations will be handled via CSS classes */
             touchAction: 'manipulation',
             WebkitTouchCallout: 'none',
             WebkitUserSelect: 'none',
             userSelect: 'none'
           }}>
        <InstagramPreview news={news} />
        
        {/* iOS Screenshot Button - Simplified for reliability */}
        <IOSScreenshotButton news={news} className="mt-4 sm:mt-6" />
        
        {/* Additional Instructions */}
        <div className="mt-6 sm:mt-8 text-center text-gray-600 text-xs sm:text-sm">
          <p>💡 Workflow complet:</p>
          <ul className="mt-2 space-y-1">
            <li>• 1. Salvează imaginea cu butonul de sus</li>
            <li>• 2. Copiază hashtag-urile cu butonul de mai jos</li>
            <li>• 3. Deschide Instagram și postează</li>
            <li>• Alternativ: click pe card pentru screenshot manual</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
