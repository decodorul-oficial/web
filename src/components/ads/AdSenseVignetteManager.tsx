"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/components/cookies/ConsentProvider";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Loads AdSense Auto Ads script once and triggers SPA page updates to allow
 * Google to show vignette interstitials on page transitions for non-premium users.
 *
 * Requirements:
 * - Set NEXT_PUBLIC_ADSENSE_PUBLISHER_ID to your `ca-pub-XXXXXXXXXXXXXXX`.
 * - Enable Vignette ads in AdSense Auto ads settings.
 * - We only run on allowlisted routes: /stiri, /stiri/[slug], /sinteza-zilnica
 * - We require analytics consent as a proxy for ad consent.
 * - We skip for authenticated users with premium/trial access.
 */
export function AdSenseVignetteManager() {
  const pathname = usePathname();
  const { hasAnalyticsConsent, isLoaded: consentLoaded } = useConsent();
  const { user, hasPremiumAccess, loading: authLoading } = useAuth();

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  const isAllowlistedRoute = useMemo(() => {
    if (!pathname) return false;
    if (pathname === "/sinteza-zilnica") return true;
    if (pathname === "/stiri") return true;
    if (pathname.startsWith("/stiri/")) return true;
    return false;
  }, [pathname]);

  const adsEnabled = useMemo(() => {
    if (!publisherId) return false;
    if (!consentLoaded) return false;
    if (!hasAnalyticsConsent) return false;
    if (authLoading) return false;
    // Show ads only when user is not premium (includes non-authenticated)
    if (user && hasPremiumAccess) return false;
    return true;
  }, [publisherId, consentLoaded, hasAnalyticsConsent, authLoading, user, hasPremiumAccess]);

  const scriptLoadedRef = useRef(false);
  const lastPushTsRef = useRef(0);
  const prevPathRef = useRef<string | null>(null);

  // Inject AdSense script once when allowed
  useEffect(() => {
    if (!adsEnabled) return;
    if (!publisherId) return;
    if (scriptLoadedRef.current) return;

    // Avoid duplicate script tags
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-adsense="true"]'
    );
    if (existing) {
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
      publisherId
    )}`;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-adsense", "true");
    document.head.appendChild(script);

    script.addEventListener("load", () => {
      scriptLoadedRef.current = true;
      // Initial page signal
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).adsbygoogle.push({});
        lastPushTsRef.current = Date.now();
      } catch {}
    });
  }, [adsEnabled, publisherId]);

  // On route changes, signal SPA page update to AdSense (throttled)
  useEffect(() => {
    if (!adsEnabled) return;
    if (!isAllowlistedRoute) return;
    if (!pathname) return;

    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    if (prev === pathname) return;

    const now = Date.now();
    const minIntervalMs = 30000; // throttle to reduce frequency
    if (now - lastPushTsRef.current < minIntervalMs) return;

    // Defer until browser is idle-ish
    const id = window.requestAnimationFrame(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).adsbygoogle.push({});
        lastPushTsRef.current = Date.now();
      } catch {}
    });

    return () => cancelAnimationFrame(id);
  }, [adsEnabled, isAllowlistedRoute, pathname]);

  return null;
}

export default AdSenseVignetteManager;


