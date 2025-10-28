'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { stripHtml } from '@/lib/html/sanitize';
import { PeriodSelector } from './PeriodSelector';
import { NewsItem } from '../types';
import { createNewsSlug } from '@/lib/utils/slugify';
import { trackNewsClick } from '../../../lib/analytics';
import { useMostReadNews } from '../contexts/MostReadNewsContext';

export function MostReadNewsSection() {
  const { stiri, isLoading, hasError, currentPeriod, setCurrentPeriod, refreshData } = useMostReadNews();
  const scrollContainerRef = useRef<HTMLUListElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  // Folosim un ref pentru a stoca valoarea acumulată a scroll-ului,
  // pentru a nu declanșa re-renderizări.
  const scrollAccumulator = useRef(0);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || isLoading || hasError || stiri.length <= 4) return;

    // Asigurăm clonarea elementelor o singură dată
    if (scrollContainer.children.length === stiri.length) {
        const originalItems = Array.from(scrollContainer.children);
        originalItems.forEach(item => {
            scrollContainer.appendChild(item.cloneNode(true));
        });
    }

    let animationFrameId: number;

    const scroll = () => {
      // Dacă suntem în hover, nu facem scroll
      if (isHovering) {
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }

      // Verificăm dacă am ajuns la jumătatea containerului
      if (scrollContainer.scrollTop >= scrollContainer.scrollHeight / 2) {
        // Resetăm scrollTop și acumulatorul pentru un loop perfect
        scrollContainer.scrollTop = 0;
        scrollAccumulator.current = 0;
      } else {
        // --- AICI ESTE LOGICA NOUĂ ---
        // 1. Definim viteza dorită (o valoare mică)
        const scrollSpeed = 0.1;
        
        // 2. Adăugăm viteza la acumulator
        scrollAccumulator.current += scrollSpeed;
        
        // 3. Aplicăm valoarea acumulată la scrollTop
        scrollContainer.scrollTop = scrollAccumulator.current;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      // NU resetăm acumulatorul la cleanup pentru a păstra poziția
      // scrollAccumulator.current = 0;
      // Curățăm elementele clonate
      while (scrollContainer.children.length > stiri.length) {
          scrollContainer.removeChild(scrollContainer.lastChild!);
      }
    };
  }, [isLoading, hasError, isHovering, stiri.length]);


  const handlePeriodChange = (period: typeof currentPeriod) => {
    setCurrentPeriod(period);
  };

  const handleNewsClick = (news: NewsItem) => {
    trackNewsClick(news.id, news.title, 'most_read');
  };

  function getSummary(content: unknown): string | undefined {
    if (!content) return undefined;
    try {
      const c = content as Record<string, unknown>;
      const raw = c.body || c.summary || c.text || (typeof c === 'string' ? c : undefined);
      return typeof raw === 'string' ? stripHtml(raw) : undefined;
    } catch {
      return undefined;
    }
  }

  function formatViewCount(count?: number): string {
    if (!count) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50/50 rounded-lg border border-gray-200/40 most-read-news">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Cele mai citite
        </h3>
        <PeriodSelector currentPeriod={currentPeriod} onPeriodChange={handlePeriodChange} />
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-12 w-12 shrink-0 rounded bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="text-center py-6">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-2">Nu s-au putut încărca știrile</p>
          <button 
            onClick={refreshData}
            className="text-xs text-brand-info hover:underline"
          >
            Încearcă din nou
          </button>
        </div>
      ) : stiri.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            Nu există încă știri cu vizualizări în această perioadă
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Încearcă să schimbi perioada sau revino mai târziu
          </p>
        </div>
      ) : (
        <ul 
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="h-96 space-y-4 overflow-y-auto scroll-behavior-smooth [scrollbar-width:none] [-ms-overflow-style:none] hover:[-webkit-scrollbar:thin] hover:[-webkit-scrollbar-thumb-color:gray-300] hover:[-webkit-scrollbar-track-color:gray-100]"
          style={{ 
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {stiri.map((n) => (
            <li key={n.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 shrink-0 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 flex items-center justify-center">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-white" />
                    <span className="text-xs font-bold text-white">
                      {formatViewCount(n.viewCount)}
                    </span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  {new Date(n.publicationDate).toLocaleDateString('ro-RO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="line-clamp-2 text-sm font-medium">
                  <Link 
                    href={`/stiri/${createNewsSlug(n.title, n.id)}`} 
                    className="hover:underline"
                    onClick={() => handleNewsClick(n)}
                  >
                    {n.title}
                  </Link>
                </p>
                <p className="line-clamp-2 text-xs text-gray-500">
                  {getSummary(n.content)?.slice(0, 90)}...
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}