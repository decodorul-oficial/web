"use client";
import { useEffect, useState } from 'react';

export function ScrollToTop() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState<number>(24); // px, echivalent cu bottom-6

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const BASE_GAP = 24; // 1.5rem (folosit și ca spațiu deasupra footerului)
    const MAX_EXTRA = 200; // plafon pentru a nu urca excesiv
    let ticking = false;

    const updatePosition = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setVisible(scrollTop > 200);

      const footer = document.querySelector('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const intrusion = Math.max(0, window.innerHeight - rect.top);
        const clamped = Math.min(intrusion, MAX_EXTRA);
        setBottomOffset(BASE_GAP + clamped);
      } else {
        setBottomOffset(BASE_GAP);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    const onResize = onScroll;

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true } as any);
    updatePosition();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize as any);
    };
  }, []);

  if (!mounted || !visible) return null;

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed right-6 z-50 w-11 h-11 rounded-full bg-brand-info text-white shadow-lg transition-all duration-500 ease-in-out hover:opacity-90 hover:scale-110 hover:shadow-xl active:scale-95 flex items-center justify-center`}
      style={{ bottom: `${bottomOffset}px` }}
    >
      <svg 
        className="h-5 w-5 transition-transform duration-300 ease-in-out" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l6 6a1 1 0 01-1.414 1.414L11 6.414V17a1 1 0 11-2 0V6.414L4.707 10.707A1 1 0 113.293 9.293l6-6A1 1 0 0110 3z" clipRule="evenodd" />
      </svg>
    </button>
  );
}


