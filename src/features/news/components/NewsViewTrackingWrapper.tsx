'use client';

import { useNewsViewTracking } from '../hooks/useNewsViewTracking';
import type { NewsItem } from '../types';

interface NewsViewTrackingWrapperProps {
  news: NewsItem;
}

export function NewsViewTrackingWrapper({ news }: NewsViewTrackingWrapperProps) {
  useNewsViewTracking(news);
  
  return null;
}
