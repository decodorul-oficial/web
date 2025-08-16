// Analytics utility functions for Google Analytics

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track page views
export const pageview = (url: string) => {
  console.log('🔍 Analytics: pageview called with URL:', url);
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('✅ Analytics: gtag available, sending pageview');
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  } else {
    console.log('❌ Analytics: gtag not available for pageview');
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
  console.log('🔍 Analytics: event called:', { action, category, label, value });
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('✅ Analytics: gtag available, sending event');
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } else {
    console.log('❌ Analytics: gtag not available for event');
  }
};

// Track news interactions
export const trackNewsClick = (newsId: string, newsTitle: string, section: string) => {
  console.log('🔍 Analytics: trackNewsClick called:', { newsId, newsTitle, section });
  event({
    action: 'news_click',
    category: 'news_interaction',
    label: `${section}: ${newsTitle}`,
  });
};

// Track search usage
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  console.log('🔍 Analytics: trackSearch called:', { searchTerm, resultsCount });
  event({
    action: 'search',
    category: 'user_interaction',
    label: searchTerm,
    value: resultsCount,
  });
};

// Track period selection
export const trackPeriodSelection = (period: string) => {
  console.log('🔍 Analytics: trackPeriodSelection called:', { period });
  event({
    action: 'period_selection',
    category: 'user_interaction',
    label: period,
  });
};

// Track section engagement
export const trackSectionView = (sectionName: string) => {
  console.log('🔍 Analytics: trackSectionView called:', { sectionName });
  event({
    action: 'section_view',
    category: 'content_engagement',
    label: sectionName,
  });
};

// Track cookie consent
export const trackConsent = (consentType: string, granted: boolean) => {
  console.log('🔍 Analytics: trackConsent called:', { consentType, granted });
  event({
    action: 'cookie_consent',
    category: 'privacy',
    label: `${consentType}: ${granted ? 'granted' : 'denied'}`,
  });
};
