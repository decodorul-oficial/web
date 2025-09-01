// Analytics utility functions for Google Analytics

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Track page views - @next/third-parties handles this automatically
// This function is kept for backward compatibility and manual page view tracking
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({ 
  action, 
  category, 
  label, 
  value 
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track news interactions
export const trackNewsClick = (newsId: string, newsTitle: string, section: string) => {
  event({
    action: 'news_click',
    category: 'news_interaction',
    label: `${section}: ${newsTitle}`,
  });
};

// Track search usage
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'user_interaction',
    label: searchTerm,
    value: resultsCount,
  });
};

// Track period selection
export const trackPeriodSelection = (period: string) => {
  event({
    action: 'period_selection',
    category: 'user_interaction',
    label: period,
  });
};

// Track section engagement
export const trackSectionView = (sectionName: string) => {
  event({
    action: 'section_view',
    category: 'content_engagement',
    label: sectionName,
  });
};

// Track cookie consent
export const trackConsent = (consentType: string, granted: boolean) => {
  event({
    action: 'cookie_consent',
    category: 'privacy',
    label: `${consentType}: ${granted ? 'granted' : 'denied'}`,
  });
};
