'use client';

import { useState, useEffect, useRef } from 'react';
import { Minus, Plus, Type } from 'lucide-react';

const FONT_SIZE_KEY = 'mo-font-size';
const MIN_FONT_SIZE = 0.8;
const MAX_FONT_SIZE = 1.4;
const FONT_SIZE_STEP = 0.1;

export function FontSizeControl() {
  const [fontSize, setFontSize] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Încarcă dimensiunea fontului din localStorage
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);
    if (savedFontSize) {
      const size = parseFloat(savedFontSize);
      if (size >= MIN_FONT_SIZE && size <= MAX_FONT_SIZE) {
        setFontSize(size);
        applyFontSize(size);
      }
    }

    // Funcția pentru detectarea apropiării de footer
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = 300; // Mărit înălțimea pentru a include newsletter button
      
      // Verifică dacă utilizatorul este aproape de footer
      const isNear = scrollTop + windowHeight >= documentHeight - footerHeight;
      setIsNearFooter(isNear);
    };

    // Adaugă event listener pentru scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Verifică poziția inițială
    handleScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Închide popoverul la click în afară sau la apăsarea tastei Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isVisible) return;
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setIsVisible(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;
      if (event.key === 'Escape') {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  const applyFontSize = (size: number) => {
    // Rotunjește la 2 zecimale pentru a evita problemele de floating point
    const roundedSize = Math.round(size * 100) / 100;
    
    // Aplică dimensiunea fontului la întregul document
    document.documentElement.style.setProperty('--content-font-size', roundedSize.toString());
    
    // Aplică la toate elementele cu clasa article-content
    const articleElements = document.querySelectorAll('.article-content');
    articleElements.forEach((element) => {
      (element as HTMLElement).style.fontSize = `${roundedSize}rem`;
    });
    
    // Aplică la toate elementele prose pentru consistență
    const proseElements = document.querySelectorAll('.prose');
    proseElements.forEach((element) => {
      (element as HTMLElement).style.fontSize = `${roundedSize}rem`;
    });

    // Aplică la heading-urile din conținutul articolelor (nu global)
    const headingElements = document.querySelectorAll(
      '.article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6, .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6'
    );
    headingElements.forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      let baseSize = 1;
      
      switch (tagName) {
        case 'h1': baseSize = 1.75; break;
        case 'h2': baseSize = 1.5; break;
        case 'h3': baseSize = 1.25; break;
        case 'h4': baseSize = 1.125; break;
        case 'h5': baseSize = 1; break;
        case 'h6': baseSize = 0.875; break;
        default: baseSize = 1;
      }
      
      (element as HTMLElement).style.fontSize = `${(baseSize * roundedSize).toFixed(2)}rem`;
    });

    // Aplică la toate paragrafele
    const paragraphElements = document.querySelectorAll('p');
    paragraphElements.forEach((element) => {
      (element as HTMLElement).style.fontSize = `${roundedSize}rem`;
    });

    // Aplică la toate listele
    const listElements = document.querySelectorAll('ul, ol, li');
    listElements.forEach((element) => {
      (element as HTMLElement).style.fontSize = `${roundedSize}rem`;
    });

    // Ajustează dimensiunea în secțiunile speciale la 80% din scala globală
    const sameDayContainers = document.querySelectorAll('.same-day-news');
    const mostReadContainers = document.querySelectorAll('.most-read-news');
    const scaledContainers = [...Array.from(sameDayContainers), ...Array.from(mostReadContainers)];
    scaledContainers.forEach((container) => {
      const localScale = Math.round(roundedSize * 0.8 * 100) / 100;
      (container as HTMLElement).style.setProperty('--content-font-size', localScale.toString());
      // Nu suprascriem dimensiunile heading-urilor pentru a păstra stilurile Tailwind ale secțiunilor
      const localParagraphs = container.querySelectorAll('p');
      localParagraphs.forEach((element) => {
        (element as HTMLElement).style.fontSize = `${localScale}rem`;
      });

      const localLists = container.querySelectorAll('ul, ol, li');
      localLists.forEach((element) => {
        (element as HTMLElement).style.fontSize = `${localScale}rem`;
      });

      const localProse = container.querySelectorAll('.prose, .article-content');
      localProse.forEach((element) => {
        (element as HTMLElement).style.fontSize = `${localScale}rem`;
      });
    });
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + FONT_SIZE_STEP, MAX_FONT_SIZE);
    const roundedSize = Math.round(newSize * 100) / 100;
    setFontSize(roundedSize);
    localStorage.setItem(FONT_SIZE_KEY, roundedSize.toString());
    applyFontSize(roundedSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - FONT_SIZE_STEP, MIN_FONT_SIZE);
    const roundedSize = Math.round(newSize * 100) / 100;
    setFontSize(roundedSize);
    localStorage.setItem(FONT_SIZE_KEY, roundedSize.toString());
    applyFontSize(roundedSize);
  };

  const resetFontSize = () => {
    setFontSize(1);
    localStorage.removeItem(FONT_SIZE_KEY);
    document.documentElement.style.removeProperty('--content-font-size');
    
    // Resetează elementele din conținut
    const allElements = document.querySelectorAll('.article-content, .prose, .article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6, .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6, p, ul, ol, li');
    allElements.forEach((element) => {
      (element as HTMLElement).style.fontSize = '';
    });

    // Reset local overrides pentru secțiunile speciale
    const sameDayContainers = document.querySelectorAll('.same-day-news');
    const mostReadContainers = document.querySelectorAll('.most-read-news');
    const scaledContainers = [...Array.from(sameDayContainers), ...Array.from(mostReadContainers)];
    scaledContainers.forEach((container) => {
      (container as HTMLElement).style.removeProperty('--content-font-size');
      const overridden = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, li, .prose, .article-content');
      overridden.forEach((el) => {
        (el as HTMLElement).style.fontSize = '';
      });
    });
  };

  // Calculează poziționarea dinamică în funcție de apropierea de footer
  const [bottomOffset, setBottomOffset] = useState<number>(24); // px for bottom-6

  useEffect(() => {
    const BASE_GAP = 24; // 1.5rem
    const SAFE_GAP = 8;
    let ticking = false;

    const updatePosition = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const overlap = Math.max(0, window.innerHeight - rect.top);
        const nextBottom = BASE_GAP + (overlap > 0 ? overlap + SAFE_GAP : 0);
        setBottomOffset(nextBottom);
      } else {
        setBottomOffset(BASE_GAP);
      }
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true } as any);
    updatePosition();
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize as any);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`fixed left-6 z-50 transition-all duration-500 ease-in-out`}
      style={{ bottom: `${bottomOffset}px` }}
    >
      {/* Butonul principal pentru a afișa/ascunde controlul */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-11 h-11 rounded-full bg-brand-info hover:bg-brand-highlight text-white flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl"
        aria-label="Control font"
        title="Control dimensiune font"
      >
        <Type className="w-5 h-5 transition-transform duration-300 ease-in-out" />
      </button>

      {/* Controlul de font - afișat când este vizibil */}
      {isVisible && (
        <div className={`absolute bottom-16 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-3 flex flex-col items-center space-y-2 min-w-[120px] transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-2`}>
          <div className="text-xs text-gray-600 font-medium text-center mb-2">
            Dimensiune font
          </div>
          
          <button
            onClick={increaseFontSize}
            disabled={fontSize >= MAX_FONT_SIZE}
            className="w-8 h-8 rounded-md bg-brand-info hover:bg-brand-highlight disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            aria-label="Mărește fontul"
            title="Mărește fontul (A+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <div className="text-xs text-gray-600 font-medium px-2 py-1 bg-gray-100 rounded min-w-[40px] text-center transition-all duration-200 ease-in-out">
            {Math.round(fontSize * 100)}%
          </div>
          
          <button
            onClick={decreaseFontSize}
            disabled={fontSize <= MIN_FONT_SIZE}
            className="w-8 h-8 rounded-md bg-brand-info hover:bg-brand-highlight disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            aria-label="Micșorează fontul"
            title="Micșorează fontul (A-)"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <button
            onClick={resetFontSize}
            className="text-xs text-gray-500 hover:text-gray-700 underline mt-2 transition-all duration-200 ease-in-out hover:text-brand-info"
            title="Resetează la dimensiunea implicită"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
