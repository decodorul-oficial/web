"use client";
import { useEffect, useState } from 'react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = 200; // Înălțimea aproximativă a footer-ului + padding
      
      // Verifică dacă utilizatorul este aproape de footer
      const isNear = scrollTop + windowHeight >= documentHeight - footerHeight;
      setIsNearFooter(isNear);
      
      // Afișează butonul doar când utilizatorul a derulat mai mult de 200px
      setVisible(scrollTop > 200);
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  // Calculează poziționarea dinamică în funcție de apropierea de footer
  const getPositionClass = () => {
    if (isNearFooter) {
      // Când este aproape de footer, mută butonul mai sus
      return "fixed bottom-32 right-6 z-50";
    } else {
      // Poziționare normală
      return "fixed bottom-6 right-6 z-50";
    }
  };

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`${getPositionClass()} rounded-full bg-brand-info p-3 text-white shadow-lg transition-all duration-500 ease-in-out hover:opacity-90 hover:scale-110 hover:shadow-xl active:scale-95`}
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


