'use client';

import { useEffect } from 'react';
import { trackNewsClick } from '../../../lib/analytics';
import type { NewsItem } from '../types';

export function useNewsViewTracking(news: NewsItem | null) {
  useEffect(() => {
    if (!news) return;

    // Track news view with additional details
    trackNewsClick(news.id, news.title, 'news_view');
  }, [news]);
}
