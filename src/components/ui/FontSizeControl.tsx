'use client';

import { useState, useEffect, useRef } from 'react';
import { Minus, Plus, RotateCcw, Type } from 'lucide-react';
import { TrialStatusBanner } from './TrialStatusBanner';

const FONT_SIZE_KEY = 'mo-font-size';
const MIN_FONT_SIZE = 0.8;
const MAX_FONT_SIZE = 1.4;
const FONT_SIZE_STEP = 0.1;

const controlBtnClass =
  'min-h-11 min-w-11 rounded-md bg-brand-info hover:bg-brand-highlight disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 ease-in-out active:scale-95 touch-manipulation';

export function FontSizeControl() {
  const [fontSize, setFontSize] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const applyFontSize = (size: number) => {
    const roundedSize = Math.round(size * 100) / 100;
    document.documentElement.style.setProperty('--content-font-size', String(roundedSize));

    // Secțiuni secundare: scară locală 80%
    const scaledContainers = [
      ...Array.from(document.querySelectorAll('.same-day-news')),
      ...Array.from(document.querySelectorAll('.most-read-news')),
    ];
    scaledContainers.forEach((container) => {
      const localScale = Math.round(roundedSize * 0.8 * 100) / 100;
      (container as HTMLElement).style.setProperty('--content-font-size', String(localScale));
    });
  };

  useEffect(() => {
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);
    if (savedFontSize) {
      const size = parseFloat(savedFontSize);
      if (size >= MIN_FONT_SIZE && size <= MAX_FONT_SIZE) {
        setFontSize(size);
        applyFontSize(size);
      }
    }
  }, []);

  // Închide popoverul la click/touch în afară sau Escape
  useEffect(() => {
    const handlePointerOutside = (event: Event) => {
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

    document.addEventListener('pointerdown', handlePointerOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  const increaseFontSize = () => {
    setFontSize((prev) => {
      const roundedSize = Math.round(Math.min(prev + FONT_SIZE_STEP, MAX_FONT_SIZE) * 100) / 100;
      localStorage.setItem(FONT_SIZE_KEY, roundedSize.toString());
      applyFontSize(roundedSize);
      return roundedSize;
    });
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => {
      const roundedSize = Math.round(Math.max(prev - FONT_SIZE_STEP, MIN_FONT_SIZE) * 100) / 100;
      localStorage.setItem(FONT_SIZE_KEY, roundedSize.toString());
      applyFontSize(roundedSize);
      return roundedSize;
    });
  };

  const resetFontSize = () => {
    setFontSize(1);
    localStorage.removeItem(FONT_SIZE_KEY);
    document.documentElement.style.removeProperty('--content-font-size');

    const scaledContainers = [
      ...Array.from(document.querySelectorAll('.same-day-news')),
      ...Array.from(document.querySelectorAll('.most-read-news')),
    ];
    scaledContainers.forEach((container) => {
      (container as HTMLElement).style.removeProperty('--content-font-size');
    });
  };

  const [bottomOffset, setBottomOffset] = useState<number>(24);

  useEffect(() => {
    const BASE_GAP = 24;
    const MAX_EXTRA = 200;
    let ticking = false;

    const updatePosition = () => {
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
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    updatePosition();
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed left-3 sm:left-6 z-50 transition-all duration-500 ease-in-out"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <div className="mb-3">
        <TrialStatusBanner />
      </div>

      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="min-h-11 min-w-11 w-11 h-11 rounded-full bg-brand-info hover:bg-brand-highlight text-white flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl touch-manipulation"
        aria-label="Control dimensiune font"
        aria-expanded={isVisible}
        title="Control dimensiune font"
      >
        <Type className="w-5 h-5" />
      </button>

      {isVisible && (
        <div
          role="dialog"
          aria-label="Dimensiune font"
          className="absolute bottom-14 left-0 w-[min(calc(100vw-1.5rem),11.5rem)] bg-white rounded-xl shadow-xl border border-gray-200 p-3 flex flex-col gap-3 animate-in slide-in-from-bottom-2"
        >
          <div className="text-sm text-gray-700 font-semibold text-center">
            Dimensiune font
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={decreaseFontSize}
              disabled={fontSize <= MIN_FONT_SIZE}
              className={controlBtnClass}
              aria-label="Micșorează fontul"
              title="Micșorează fontul (A-)"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div
              className="min-h-11 min-w-[3.25rem] px-2 flex items-center justify-center text-sm font-semibold text-gray-800 bg-gray-100 rounded-md"
              aria-live="polite"
            >
              {Math.round(fontSize * 100)}%
            </div>

            <button
              type="button"
              onClick={increaseFontSize}
              disabled={fontSize >= MAX_FONT_SIZE}
              className={controlBtnClass}
              aria-label="Mărește fontul"
              title="Mărește fontul (A+)"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={resetFontSize}
            className="min-h-11 w-full inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-brand-info/40 hover:text-brand-info transition-colors touch-manipulation"
            aria-label="Resetează dimensiunea fontului"
            title="Resetează la dimensiunea implicită"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
