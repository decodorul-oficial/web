# Google AdSense Interstitial (Vignette) Ads Implementation

## Overview

This implementation adds full-page interstitial ads (Vignette) that appear when users navigate between news article pages (`/stiri/[slug]`). These ads are shown only to non-authenticated users and users without premium access.

## Features

- **Full-page interstitial ads** that overlay the entire page
- **User consent required** - ads only show if user has given analytics consent
- **Premium user exclusion** - authenticated users with subscriptions or active trials don't see ads
- **Throttled display** - minimum 30 seconds between ads to prevent spam
- **Route-specific** - only shows on news-related pages

## Implementation Details

### Component: `AdSenseVignetteManager`

Located at: `src/components/ads/AdSenseVignetteManager.tsx`

**Key Features:**
- Loads Google AdSense Auto Ads script once per session
- Triggers SPA page updates on route changes to enable interstitial ads
- Includes throttling mechanisms to improve user experience
- Prevents ads on the same route (e.g., page refresh)
- Only runs on allowlisted routes: `/stiri`, `/stiri/[slug]`, `/sinteza-zilnica`

### Configuration

1. **Environment Variable:**
   ```bash
   NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-9498513482136133
   ```

2. **Google AdSense Setup:**
   - Enable "Vignette ads" in AdSense Auto ads settings
   - Ensure your site is approved for interstitial ads
   - Configure ad targeting and frequency in AdSense dashboard

3. **Route Allowlist:**
   - `/stiri` - News listing page
   - `/stiri/[slug]` - Individual news articles
   - `/sinteza-zilnica` - Daily synthesis page

### User Exclusion Logic

Ads are **NOT** shown to:
- Users with active subscriptions (`subscriptionTier !== 'free'`)
- Users with active trials (`trialStatus.isTrial && !trialStatus.expired`)
- Users who haven't given analytics consent
- Users navigating to the same page (refresh protection)

### Timing Controls

- **Minimum interval:** 30 seconds between ads
- **Same-route protection:** No ads when navigating to the same URL
- **Throttling:** Additional checks to prevent rapid ad display

### Integration Points

1. **Layout Integration:** Component is included in `src/app/layout.tsx`
2. **Auth Integration:** Uses `useAuth()` hook for premium status checking
3. **Consent Integration:** Uses `useConsent()` hook for analytics consent verification
4. **Navigation Integration:** Uses `usePathname()` for route change detection

## Testing

### Manual Testing Steps:

1. **Non-authenticated user:**
   - Navigate between `/stiri/[slug]` pages
   - Should see interstitial ads after 30+ seconds
   - Ads should require user interaction to close

2. **Premium user:**
   - Login with subscription or trial account
   - Navigate between news pages
   - Should NOT see any interstitial ads

3. **Consent testing:**
   - Visit site without analytics consent
   - Navigate between pages
   - Should NOT see ads until consent is given

### Development Testing:

```bash
# Build and test locally
npm run build
npm run start

# Check for AdSense script loading in browser dev tools
# Look for: pagead2.googlesyndication.com/pagead/js/adsbygoogle.js
```

## Troubleshooting

### Common Issues:

1. **Ads not showing:**
   - Check if `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` is set
   - Verify analytics consent is given
   - Ensure user is not premium/authenticated
   - Check browser console for AdSense errors

2. **Ads showing too frequently:**
   - Check if timing controls are working (30s minimum)
   - Verify same-route protection is active
   - Review AdSense dashboard frequency settings

3. **Ads not closing:**
   - This is controlled by Google AdSense algorithms
   - Check AdSense dashboard for Vignette ad settings
   - Ensure site is approved for interstitial ads

### Debug Information:

Check browser console for:
- AdSense script loading messages
- SPA page update signals
- Any JavaScript errors related to ads

## Performance Impact

- **Script loading:** AdSense script loads once per session
- **Memory usage:** Minimal - only a few refs and timers
- **Network:** Single script load + occasional page update signals
- **UX:** Throttled to prevent disruption

## Compliance

- **GDPR compliant:** Requires explicit consent via analytics cookies
- **User-friendly:** Premium users are completely excluded
- **Non-intrusive:** Throttled timing prevents ad spam
- **Transparent:** Privacy policy mentions interstitial ads

## Future Improvements

- Add A/B testing for different timing intervals
- Implement user feedback on ad experience
- Add analytics tracking for ad performance
- Consider implementing custom close button styling (if allowed by AdSense)
