'use client';

import { useEffect } from 'react';
import { trackNewsClick } from '../../../lib/analytics';
import { useNewsletterTracking } from '../../newsletter/hooks/useNewsletterTracking';
import type { NewsItem } from '../types';

export function useNewsViewTracking(news: NewsItem | null) {
  const { trackNewsView } = useNewsletterTracking();

  useEffect(() => {
    if (!news) return;

    // Track news view with additional details
    trackNewsClick(news.id, news.title, 'news_view');
    
    // Track pentru newsletter (doar dacă utilizatorul a acceptat cookie-urile)
    // Pasează ID-ul știrii pentru a preveni tracking-ul multiplu
    trackNewsView(news.id);
  }, [news, trackNewsView]);
}
