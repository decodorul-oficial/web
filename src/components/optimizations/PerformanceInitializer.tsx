'use client';

import { useEffect } from 'react';
import { initializePerformanceOptimizations } from '@/lib/optimizations/performance';

export function PerformanceInitializer() {
  useEffect(() => {
    initializePerformanceOptimizations();
  }, []);

  return null; // This component doesn't render anything
}
