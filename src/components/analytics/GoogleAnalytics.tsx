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
    // TEMPORARY DEBUGGING FOR PRODUCTION
    console.log('🔍 GoogleAnalytics Debug:', {
      hasAnalyticsConsent,
      GA_TRACKING_ID,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    if (!hasAnalyticsConsent || !GA_TRACKING_ID) {
      console.log('❌ GoogleAnalytics: Missing consent or GA ID');
      return;
    }

    console.log('✅ GoogleAnalytics: Starting initialization...');

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ GoogleAnalytics: Script loaded successfully');
    };
    
    script.onerror = (error) => {
      console.error('❌ GoogleAnalytics: Script failed to load:', error);
    };

    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: unknown[]) {
      console.log('📊 GoogleAnalytics: Event pushed to dataLayer:', args);
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    console.log('✅ GoogleAnalytics: Initialization complete');

    return () => {
      console.log('🧹 GoogleAnalytics: Cleaning up...');
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
