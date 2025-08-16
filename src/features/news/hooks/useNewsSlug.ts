import { useMemo } from 'react';
import { createNewsSlug } from '@/lib/utils/slugify';
import type { NewsItem } from '../types';

/**
 * Hook pentru generarea slug-urilor pentru știri în componentele client-side
 * Optimizat pentru a fi mai rapid
 */
export function useNewsSlug(news: NewsItem | null) {
  return useMemo(() => {
    if (!news) return '';
    return createNewsSlug(news.title, news.id);
  }, [news]);
}

/**
 * Hook pentru generarea slug-urilor pentru o listă de știri
 * Optimizat pentru a fi mai rapid
 */
export function useNewsSlugs(newsList: NewsItem[]) {
  return useMemo(() => {
    return newsList.map(news => ({
      ...news,
      slug: createNewsSlug(news.title, news.id)
    }));
  }, [newsList]);
}
