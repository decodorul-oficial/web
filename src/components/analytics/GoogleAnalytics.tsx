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

    // Check for CSP errors in console
    const originalConsoleError = console.error;
    console.error = function(...args) {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Content Security Policy')) {
        console.log('🚨 CSP ERROR DETECTED:', args);
      }
      originalConsoleError.apply(console, args);
    };

    // Monitor network requests to Google Analytics
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('google-analytics.com')) {
        console.log('🔍 GoogleAnalytics: Fetch request to GA detected:', url);
      }
      return originalFetch.apply(this, args);
    };

    // Monitor XMLHttpRequest to Google Analytics
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
      if (typeof url === 'string' && url.includes('google-analytics.com')) {
        console.log('🔍 GoogleAnalytics: XHR request to GA detected:', url);
      }
      return originalXHROpen.call(this, method, url, async, username, password);
    };

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    
    // Add real script loading verification
    script.onload = () => {
      console.log('✅ GoogleAnalytics: Script loaded successfully (onload fired)');
      
      // Verify that gtag is actually available after script loads
      if (typeof window.gtag === 'function') {
        console.log('✅ GoogleAnalytics: window.gtag is available after script load');
      } else {
        console.error('❌ GoogleAnalytics: window.gtag is NOT available after script load');
      }
    };
    
    script.onerror = (error) => {
      console.error('❌ GoogleAnalytics: Script failed to load:', error);
    };

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="${GA_TRACKING_ID}"]`);
    if (existingScript) {
      console.log('⚠️ GoogleAnalytics: Script already exists, removing old one');
      existingScript.remove();
    }

    document.head.appendChild(script);
    console.log('✅ GoogleAnalytics: Script element appended to head');

    // Verify script is in DOM
    setTimeout(() => {
      const scriptInDOM = document.querySelector(`script[src*="${GA_TRACKING_ID}"]`);
      if (scriptInDOM) {
        console.log('✅ GoogleAnalytics: Script found in DOM:', scriptInDOM);
        console.log('🔍 Script src:', scriptInDOM.getAttribute('src'));
        console.log('🔍 Script parent:', scriptInDOM.parentElement);
      } else {
        console.error('❌ GoogleAnalytics: Script NOT found in DOM after append');
      }
    }, 100);

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

    // Add a delayed check to see if gtag is truly available after script execution
    setTimeout(() => {
      if (typeof window.gtag === 'function') {
        console.log('✅ GoogleAnalytics: window.gtag is a function after delay');
        
        // Test if we can actually send a test event
        try {
          window.gtag('event', 'test_event', {
            event_category: 'debug',
            event_label: 'script_verification'
          });
          console.log('✅ GoogleAnalytics: Test event sent successfully');
        } catch (error) {
          console.error('❌ GoogleAnalytics: Failed to send test event:', error);
        }
      } else {
        console.error('❌ GoogleAnalytics: window.gtag is NOT a function after delay. Script might be blocked or failed to load.');
      }
    }, 3000); // Check after 3 seconds

    // Check for network requests to Google Analytics
    setTimeout(() => {
      console.log('🔍 GoogleAnalytics: Checking for network requests...');
      
      // Try to manually check if the script URL is accessible
      fetch(`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`, { 
        method: 'HEAD',
        mode: 'no-cors'
      }).then(() => {
        console.log('✅ GoogleAnalytics: Script URL is accessible via fetch');
      }).catch((error) => {
        console.error('❌ GoogleAnalytics: Script URL is NOT accessible via fetch:', error);
      });
    }, 5000);

    // Monitor dataLayer for actual GA requests
    const originalPush = window.dataLayer.push;
    window.dataLayer.push = function(...args) {
      console.log('📊 GoogleAnalytics: dataLayer.push called with:', args);
      
      // Check if this is a config or event that should trigger a collect request
      if (args[0] && Array.isArray(args[0])) {
        const [command, ...params] = args[0];
        if (command === 'config' || command === 'event') {
          console.log('🔍 GoogleAnalytics: This should trigger a collect request:', { command, params });
        }
      }
      
      return originalPush.apply(this, args);
    };

    return () => {
      console.log('🧹 GoogleAnalytics: Cleaning up analytics');
      const existingScript = document.querySelector(`script[src*="${GA_TRACKING_ID}"]`);
      if (existingScript) {
        existingScript.remove();
      }
      (window as any).gtag = undefined;
      
      // Restore original functions
      console.error = originalConsoleError;
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      window.dataLayer.push = originalPush;
    };
  }, [hasAnalyticsConsent]);

  // Don't render anything if no consent
  if (!hasAnalyticsConsent) {
    return null;
  }

  return null;
}
