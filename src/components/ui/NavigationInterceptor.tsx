"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { navigationLoader } from './navigationLoader';

export function NavigationInterceptor() {
  const pathname = usePathname();

  useEffect(() => {
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
      // Internal navigation - show overlay (defer to avoid updates during useInsertionEffect)
      setTimeout(() => navigationLoader.start(), 0);
    };

    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function (this: History, ...args: any[]) {
      setTimeout(() => navigationLoader.start(), 0);
      return origPush.apply(this, args as any);
    } as any;
    history.replaceState = function (this: History, ...args: any[]) {
      setTimeout(() => navigationLoader.start(), 0);
      return origReplace.apply(this, args as any);
    } as any;

    const onPop = () => setTimeout(() => navigationLoader.start(), 0);

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
    // Small defer to allow route transition to mount and beacon to run as well
    setTimeout(() => navigationLoader.reset(), 100);
  }, [pathname]);

  return null;
}


