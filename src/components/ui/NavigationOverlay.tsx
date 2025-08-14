"use client";
import { useEffect, useState } from 'react';
import { navigationLoader } from './navigationLoader';

export function NavigationOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = navigationLoader.subscribe(setVisible);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-white/70 backdrop-blur">
      <div className="flex items-center gap-3 rounded-md border bg-white px-4 py-2 shadow">
        <svg className="h-5 w-5 animate-spin text-brand-info" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
          <path className="opacity-75" d="M4 12a8 8 0 018-8" strokeWidth="4"></path>
        </svg>
        <span className="text-sm text-gray-700">Se încarcă…</span>
      </div>
    </div>
  );
}


