'use client';

import { useEffect, useRef } from 'react';
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
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!hasAnalyticsConsent || !GA_TRACKING_ID) {
      // Clean up if consent is revoked
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
        initializedRef.current = false;
      }
      return;
    }

    // Prevent multiple initializations
    if (initializedRef.current) {
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="${GA_TRACKING_ID}"]`);
    if (existingScript) {
      scriptRef.current = existingScript as HTMLScriptElement;
      initializedRef.current = true;
      return;
    }

    // Initialize dataLayer and gtag safely
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      
      // Only define gtag if it doesn't exist
      if (typeof window.gtag === 'undefined') {
        window.gtag = function(...args: unknown[]) {
          window.dataLayer.push(args);
        };
      }
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    
    script.onload = () => {
      if (typeof window.gtag === 'function') {
        window.gtag('js', new Date());
        window.gtag('config', GA_TRACKING_ID, {
          page_title: document.title,
          page_location: window.location.href,
        });
        initializedRef.current = true;
      }
    };

    script.onerror = () => {
      // Silent error handling for production
      scriptRef.current = null;
      initializedRef.current = false;
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Cleanup only if this component is unmounting
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.remove();
        scriptRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [hasAnalyticsConsent]);

  // Don't render anything
  return null;
}
