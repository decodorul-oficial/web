'use client';

import { useState, useEffect } from 'react';
import { InstagramPreview } from '@/components/admin/InstagramPreview';
import { IOSScreenshotButton } from '@/components/admin/IOSScreenshotButton';
import { fetchNewsById } from '@/features/news/services/newsService';
import { NewsItem } from '@/features/news/types';
import { HashtagSection } from '@/components/admin/HashtagSection';

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
    
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-2 sm:p-4">
      {/* Back Button */}
      <div className="flex justify-center w-full">
        <button
          onClick={() => window.location.href = '/admin/instagram/'}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
        >
          ← Înapoi la lista de știri
        </button>
      </div>
      <IOSScreenshotButton news={news} className="mt-4 sm:mt-6" />
      <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-center mt-4 sm:mt-8">
        {/* Instagram Preview - keep max width as before */}
        <div
          className="w-full max-w-xl md:max-w-2xl"
          style={{
            touchAction: 'manipulation',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
        >
          <InstagramPreview news={news} />
        </div>
        {/* Hashtag Section - max width */}
        <div className="w-full max-w-lg md:max-w-xl flex-shrink-0">
          <HashtagSection news={news} />
        </div>
      </div>
    </div>
  );
}
