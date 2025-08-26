'use client';

import { useState, useEffect } from 'react';
import { fetchLatestNews } from '@/features/news/services/newsService';
import { NewsItem } from '@/features/news/types';
import { InstagramCard } from './InstagramCard';

export function InstagramFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = async () => {
    try {
      const response = await fetchLatestNews({ limit: 20 });
      setNews(response.stiri || []);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Ultimele {news.length} știri
          </h2>
          <p className="text-brand-soft text-sm">
            Click pe o imagine pentru a o deschide în tab nou pentru screenshot
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-brand-info hover:bg-brand-highlight text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {refreshing ? 'Se actualizează...' : 'Actualizează'}
        </button>
      </div>

      {/* Instagram Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {news.map((item, index) => (
          <InstagramCard key={item.id} news={item} index={index} />
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg">
            Nu s-au găsit știri disponibile
          </div>
        </div>
      )}
    </div>
  );
}
