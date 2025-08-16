'use client';

import { useNewsViewTracking } from '@/features/news/hooks/useNewsViewTracking';

interface NewsViewTrackerProps {
  newsId: string;
}

export function NewsViewTracker({ newsId }: NewsViewTrackerProps) {
  useNewsViewTracking(newsId);
  
  // This component doesn't render anything, it just tracks views
  // Optimizat pentru a fi mai rapid
  return null;
}
