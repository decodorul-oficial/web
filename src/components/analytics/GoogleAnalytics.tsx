'use client';

import { useEffect } from 'react';
import { useConsent } from '../cookies/ConsentProvider';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const { hasAnalyticsConsent } = useConsent();

  useEffect(() => {
    if (!hasAnalyticsConsent || !GA_TRACKING_ID) {
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: unknown[]) {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    return () => {
      // Cleanup script when component unmounts or consent changes
      const existingScript = document.querySelector(`script[src*="${GA_TRACKING_ID}"]`);
      if (existingScript) {
        existingScript.remove();
      }
      // Clear gtag function
      (window as any).gtag = undefined;
    };
  }, [hasAnalyticsConsent]);

  // Don't render anything if no consent
  if (!hasAnalyticsConsent) {
    return null;
  }

  return null;
}
