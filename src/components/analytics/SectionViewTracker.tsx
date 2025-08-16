'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackSectionView } from '../../lib/analytics';

export function SectionViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Ensure pathname is always defined before processing
    if (!pathname) return;

    // Map pathnames to section names
    let sectionName = 'home';
    
    if (pathname.startsWith('/stiri')) {
      sectionName = 'news';
    } else if (pathname.startsWith('/contact')) {
      sectionName = 'contact';
    } else if (pathname.startsWith('/legal')) {
      sectionName = 'legal';
    } else if (pathname.startsWith('/privacy')) {
      sectionName = 'privacy';
    } else if (pathname.startsWith('/cookies')) {
      sectionName = 'cookies';
    } else if (pathname === '/') {
      sectionName = 'home';
    }

    // Track section view only if we have a valid section name
    if (sectionName) {
      trackSectionView(sectionName);
    }
  }, [pathname]);

  return null;
}
