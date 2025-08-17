'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { useConsent } from '../cookies/ConsentProvider';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalyticsWrapper() {
  const { hasAnalyticsConsent } = useConsent();

  if (!hasAnalyticsConsent || !GA_TRACKING_ID) {
    return null;
  }

  return <GoogleAnalytics gaId={GA_TRACKING_ID} />;
}
