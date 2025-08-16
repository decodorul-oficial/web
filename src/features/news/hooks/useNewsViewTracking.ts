'use client';

import { useEffect } from 'react';

export function useNewsViewTracking(newsId: string) {
  useEffect(() => {
    // Tracking is now handled automatically by the API when calling getStireById
    // No manual tracking needed
    // Optimizat pentru a fi mai rapid
  }, [newsId]);
}
