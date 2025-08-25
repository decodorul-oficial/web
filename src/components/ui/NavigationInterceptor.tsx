"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { navigationLoader } from './navigationLoader';

export function NavigationInterceptor() {
  const pathname = usePathname();

  // Allowlist pentru schimbări de query care ar trebui să afișeze overlay-ul global.
  // Lăsăm lista goală pentru moment. În viitor se pot adăuga rute și chei grele
  // de query care provoacă fetch-uri costisitoare, de ex:
  // { pathname: '/stiri', keys: ['search', 'filters'] }
  // { pathname: '/rapoarte', keys: '*' } // toate schimbările de query la această rută
  const HEAVY_QUERY_ALLOWLIST: Array<{ pathname: string; keys?: string[] | '*' }> = [];

  const shouldTriggerForQueryChange = (prevUrl: URL, nextUrl: URL): boolean => {
    if (prevUrl.pathname !== nextUrl.pathname) return false;
    if (prevUrl.search === nextUrl.search) return false;
    for (const rule of HEAVY_QUERY_ALLOWLIST) {
      if (rule.pathname !== nextUrl.pathname) continue;
      if (rule.keys === '*') return true;
      if (!rule.keys || rule.keys.length === 0) continue;
      const prevParams = new URLSearchParams(prevUrl.search);
      const nextParams = new URLSearchParams(nextUrl.search);
      for (const key of rule.keys) {
        if (prevParams.get(key) !== nextParams.get(key)) {
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    let lastPathname = location.pathname;

    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if ((e as any).button !== 0) return; // only left click
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin) return; // external
      // Internal navigation - show overlay when pathname changes
      if (url.pathname !== location.pathname) {
        lastPathname = url.pathname;
        setTimeout(() => navigationLoader.start(), 0);
      } else if (shouldTriggerForQueryChange(new URL(location.href), url)) {
        // or when a query-only change is explicitly allowlisted
        setTimeout(() => navigationLoader.start(), 0);
      }
    };

    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function (this: History, ...args: any[]) {
      try {
        const urlArg = args[2];
        if (typeof urlArg !== 'undefined') {
          const next = new URL(String(urlArg), location.href);
          if (next.pathname !== location.pathname) {
            lastPathname = next.pathname;
            setTimeout(() => navigationLoader.start(), 0);
          } else if (shouldTriggerForQueryChange(new URL(location.href), next)) {
            setTimeout(() => navigationLoader.start(), 0);
          }
        } else {
          setTimeout(() => navigationLoader.start(), 0);
        }
      } catch {
        setTimeout(() => navigationLoader.start(), 0);
      }
      return origPush.apply(this, args as any);
    } as any;
    history.replaceState = function (this: History, ...args: any[]) {
      try {
        const urlArg = args[2];
        if (typeof urlArg !== 'undefined') {
          const next = new URL(String(urlArg), location.href);
          if (next.pathname !== location.pathname) {
            lastPathname = next.pathname;
            setTimeout(() => navigationLoader.start(), 0);
          } else if (shouldTriggerForQueryChange(new URL(location.href), next)) {
            setTimeout(() => navigationLoader.start(), 0);
          }
        } else {
          setTimeout(() => navigationLoader.start(), 0);
        }
      } catch {
        setTimeout(() => navigationLoader.start(), 0);
      }
      return origReplace.apply(this, args as any);
    } as any;

    const onPop = () => {
      const nextPath = location.pathname;
      if (nextPath !== lastPathname) {
        lastPathname = nextPath;
        setTimeout(() => navigationLoader.start(), 0);
      } else if (shouldTriggerForQueryChange(new URL(location.href), new URL(location.href))) {
        // With popstate we can't access prev URL easily; this branch is mostly redundant
        // but kept for symmetry in case we later track previous in state.
        setTimeout(() => navigationLoader.start(), 0);
      }
    };

    document.addEventListener('click', onClickCapture, true);
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('popstate', onPop);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  // When the pathname changes on client, end overlay (page-level beacons can extend it if needed)
  useEffect(() => {
    // Ensure pathname is defined before processing
    if (pathname !== undefined) {
      // Reduc defer-ul de la 100ms la 50ms pentru o experiență mai rapidă
      setTimeout(() => navigationLoader.reset(), 50);
    }
  }, [pathname]);

  return null;
}


