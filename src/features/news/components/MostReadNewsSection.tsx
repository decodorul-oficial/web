'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { fetchMostReadStiri } from '@/features/news/services/newsService';
import { stripHtml } from '@/lib/html/sanitize';
import { PeriodSelector } from './PeriodSelector';
import { NEWS_VIEW_PERIODS, type NewsViewPeriod } from '../config/periods';
import { NewsItem } from '../types';
import { createNewsSlug } from '@/lib/utils/slugify';

export function MostReadNewsSection() {
  const [currentPeriod, setCurrentPeriod] = useState<NewsViewPeriod>('7d');
  const [stiri, setStiri] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadNews = async (period: NewsViewPeriod) => {
    setIsLoading(true);
    setHasError(false);
    try {
      // Optimizat pentru a fi mai rapid
      const result = await fetchMostReadStiri({ limit: 4, period });
      setStiri(result.stiri || []);
    } catch (error) {
      console.error('Failed to load most read news:', error);
      setHasError(true);
      setStiri([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadNews(currentPeriod);
  }, []);

  const handlePeriodChange = (period: NewsViewPeriod) => {
    setCurrentPeriod(period);
    loadNews(period);
  };

  function getSummary(content: unknown): string | undefined {
    if (!content) return undefined;
    try {
      const c = content as any;
      const raw = c.summary || c.body || c.text || (typeof c === 'string' ? c : undefined);
      return typeof raw === 'string' ? stripHtml(raw) : raw;
    } catch {
      return undefined;
    }
  }

  function formatViewCount(count?: number): string {
    if (!count) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  }

  const currentConfig = NEWS_VIEW_PERIODS[currentPeriod];

  return (
    <div className="space-y-4 p-4 bg-gray-50/50 rounded-lg border border-gray-200/40">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Most reads
          {/* <span className="ml-2 text-xs font-normal text-gray-400">
            ({currentConfig.labelRo.toLowerCase()})
          </span> */}
        </h3>
        <PeriodSelector currentPeriod={currentPeriod} onPeriodChange={handlePeriodChange} />
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-12 w-12 shrink-0 rounded bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="text-center py-6">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-2">Nu s-au putut încărca știrile</p>
          <button 
            onClick={() => loadNews(currentPeriod)}
            className="text-xs text-brand-info hover:underline"
          >
            Încearcă din nou
          </button>
        </div>
      ) : stiri.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            Nu există încă știri cu vizualizări în această perioadă
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Încearcă să schimbi perioada sau revino mai târziu
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {stiri.map((n) => (
            <li key={n.id} className="flex items-start gap-3">
              <div className="h-12 w-12 shrink-0 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {formatViewCount(n.viewCount)}
                </span>
                <Eye className="ml-1 h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="line-clamp-2 text-sm font-medium">
                  <Link href={`/stiri/${createNewsSlug(n.title, n.id)}`} className="hover:underline">
                    {n.title}
                  </Link>
                </p>
                <p className="line-clamp-2 text-xs text-gray-500">
                  {getSummary(n.content)?.slice(0, 90)}...
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
