'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, type FC } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchNewsByDate, fetchLatestNews } from '@/features/news/services/newsService';
import { Citation } from '@/components/legal/Citation';
import { stripHtml } from '@/lib/html/sanitize';
import { MostReadNewsSection } from './MostReadNewsSection';
import { Gavel, Landmark, X, ChevronLeft, ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
// Removed massive Lucide import - using specific imports instead
import type { LucideProps, LucideIcon } from 'lucide-react';
import { getLucideIcon } from '@/lib/optimizations/lazyIcons';
import { createNewsSlug } from '@/lib/utils/slugify';
import { trackNewsClick } from '../../../lib/analytics';
import type { NewsItem } from '@/features/news/types';
import { extractParteaFromFilename } from '@/lib/utils/monitorulOficial';
import { useNewsletterContext } from '@/components/newsletter/NewsletterProvider';
import BusinessDayDatePicker from '@/components/ui/BusinessDayDatePicker';
import { useLatestNews } from '../contexts/LatestNewsContext';
import { useAuth } from '@/components/auth/AuthProvider';

// Use the official LucideIcon type instead of custom type

// Interfață pentru structura conținutului unei știri
interface NewsContent {
  body?: string;
  summary?: string;
  text?: string;
  act?: string;
  actName?: string;
  partea?: string;
  monitorulOficial?: string;
  moNumberDate?: string;
  sourceUrl?: string;
  url?: string;
  lucide_icon?: string;
  lucideIcon?: string;
}

// Interfață pentru câmpurile de citare
interface CitationFields {
  act: string | undefined;
  partea: string;
  numarSiData: string | undefined;
  sourceUrl: string | undefined;
}

/**
 * Funcție helper pentru a parsa în siguranță conținutul unei știri,
 * care poate fi un obiect sau un string JSON.
 * @param content - Conținutul de parsat.
 * @returns Un obiect cu conținutul parsat sau un obiect gol.
 */
function parseContent(content: unknown): Partial<NewsContent> {
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch {
            return {};
        }
    }
    if (typeof content === 'object' && content !== null) {
        return content as Partial<NewsContent>;
    }
    return {};
}

export function LatestNewsSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showNewsletterModal } = useNewsletterContext();
  const { featured, setFeatured } = useLatestNews(); // Folosim contextul pentru a seta știrea featured
  const { hasPremiumAccess, isAuthenticated } = useAuth();
  const [stiri, setStiri] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filteredStiri, setFilteredStiri] = useState<NewsItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showDateInput, setShowDateInput] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState<boolean>(false);
  
  const itemsPerPageOptions = [10, 25, 50, 100];

  // Calculează știrile pentru listă (exclude prima știre pentru a evita duplicarea)
  const listStiri = stiri.length > 1 ? stiri.slice(1) : stiri;
  
  const loadLatestNewsWithPagination = useCallback(async (page: number = 1): Promise<void> => {
    try {
      setIsLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const result = await fetchLatestNews({
        limit: itemsPerPage,
        offset,
        orderBy: 'publicationDate',
        orderDirection: 'desc'
      });
      
      setStiri(result.stiri);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.totalCount);
      setCurrentPage(page);
      
      // Setează știrea featured în context doar pentru prima pagină
      if (page === 1 && result.stiri.length > 0) {
        setFeatured(result.stiri[0]);
      }
    } catch (error) {
      console.error('Error loading latest news:', error);
      setStiri([]);
      setTotalPages(1);
      setTotalCount(0);
      setFeatured(null);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, setFeatured]);

  const loadNewsByDate = useCallback(async (date: string): Promise<void> => {
    try {
      setIsLoading(true);
      const newsByDate = await fetchNewsByDate(date, undefined, 100);
      setFilteredStiri(newsByDate);
      setIsFiltered(true);
      setTotalPages(Math.ceil(newsByDate.length / itemsPerPage));
    } catch (error) {
      console.error('Error loading news by date:', error);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  // Inițializare din URL params
  useEffect(() => {
    const urlDate = searchParams.get('date');
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlItemsPerPage = parseInt(searchParams.get('itemsPerPage') || '10', 10);
    
    // Setează itemsPerPage din URL dacă este valid
    if (itemsPerPageOptions.includes(urlItemsPerPage)) {
      setItemsPerPage(urlItemsPerPage);
    }
    
    if (urlDate) {
      setSelectedDate(urlDate);
      setIsFiltered(true);
      setCurrentPage(urlPage);
      void loadNewsByDate(urlDate);
    } else {
      setSelectedDate('');
      setIsFiltered(false);
      setCurrentPage(urlPage);
      void loadLatestNewsWithPagination(urlPage);
    }
  }, [searchParams, loadNewsByDate, loadLatestNewsWithPagination]);

  // Effect pentru schimbări manuale ale datei
  useEffect(() => {
    const urlDate = searchParams.get('date');
    if (selectedDate && selectedDate !== urlDate) {
      void loadNewsByDate(selectedDate);
    } else if (!selectedDate && !urlDate && isFiltered) {
      setIsFiltered(false);
      setFilteredStiri([]);
      void loadLatestNewsWithPagination(1);
    }
  }, [selectedDate, isFiltered, loadNewsByDate, loadLatestNewsWithPagination, searchParams]);

  const updateURL = useCallback((newDate?: string, newPage?: number, newItemsPerPage?: number) => {
    const params = new URLSearchParams();
    
    const dateToUse = newDate !== undefined ? newDate : selectedDate;
    const pageToUse = newPage !== undefined ? newPage : currentPage;
    const itemsPerPageToUse = newItemsPerPage !== undefined ? newItemsPerPage : itemsPerPage;
    
    if (dateToUse) {
      params.set('date', dateToUse);
    }
    
    if (pageToUse > 1) {
      params.set('page', pageToUse.toString());
    }
    
    if (itemsPerPageToUse !== 10) {
      params.set('itemsPerPage', itemsPerPageToUse.toString());
    }
    
    const newURL = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newURL, { scroll: false });
  }, [selectedDate, currentPage, itemsPerPage, router]);

  const handleDateChangeFlow = (date: string) => {
    setSelectedDate(date);
    setShowDateInput(false);
    setCurrentPage(1);
    updateURL(date, 1);
  };

  const clearDateFilter = () => {
    setSelectedDate('');
    setIsFiltered(false);
    setCurrentPage(1);
    setFilteredStiri([]);
    setShowDateInput(false);
    updateURL('', 1);
    void loadLatestNewsWithPagination(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setShowItemsPerPageDropdown(false);
    updateURL(undefined, 1, newItemsPerPage);
    void loadLatestNewsWithPagination(1);
  };

  const getCurrentPageItems = (): NewsItem[] => {
    if (isFiltered) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredStiri.slice(startIndex, startIndex + itemsPerPage);
    } else {
      // Pentru server-side pagination, folosește listStiri (exclude prima știre pentru a evita duplicarea)
      return listStiri;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ro-RO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  function getSummary(content: unknown): string {
    const c = parseContent(content);
    let rawText: string;
    
    if (c.body || c.summary || c.text) {
        rawText = c.body || c.summary || c.text || '';
    } else if (typeof content === 'string' && !content.startsWith('{')) {
        // Cazul în care conținutul este un string simplu, nu un JSON.
        rawText = content;
    } else {
        rawText = '';
    }
    
    return stripHtml(rawText);
  }

  function getCitationFields(content: unknown, filename?: string): CitationFields {
    const c = parseContent(content);
    const extractedPartea = extractParteaFromFilename(filename);
    
    return {
      act: c.act || c.actName || undefined,
      partea: extractedPartea || c.partea || 'Partea I',
      numarSiData: c.monitorulOficial || c.moNumberDate || undefined,
      sourceUrl: c.sourceUrl || c.url || undefined
    };
  }

  function toPascalCase(value: string): string {
    return value
      .split(/[\s-_]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }

  function getLucideIconForContent(content: unknown, fallback: LucideIcon): LucideIcon {
    const c = parseContent(content);
    const iconName = c.lucide_icon ?? c.lucideIcon;

    if (typeof iconName === 'string' && iconName.trim().length > 0) {
      // Use the optimized lazy loading utility
      getLucideIcon(iconName, fallback).then(icon => {
        // This will be handled asynchronously, but we return fallback immediately
        // to avoid blocking the render
      });
    }
    return fallback;
  }

  const handleNewsClick = (news: NewsItem, section: string): void => {
    trackNewsClick(news.id, news.title, section);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => {
            const newPage = Math.max(1, currentPage - 1);
            if (!isFiltered) {
              void loadLatestNewsWithPagination(newPage);
            }
            setCurrentPage(newPage);
            updateURL(undefined, newPage);
          }}
          disabled={currentPage === 1}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Pagina anterioară"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {(() => {
            const pages = [];
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
              startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => {
                    if (!isFiltered) {
                      void loadLatestNewsWithPagination(1);
                    }
                    setCurrentPage(1);
                    updateURL(undefined, 1);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  1
                </button>
              );
              
              if (startPage > 2) {
                pages.push(
                  <span key="ellipsis1" className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => {
                    if (!isFiltered) {
                      void loadLatestNewsWithPagination(i);
                    }
                    setCurrentPage(i);
                    updateURL(undefined, i);
                  }}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    i === currentPage
                      ? 'bg-brand-accent text-white font-medium'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {i}
                </button>
              );
            }

            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="ellipsis2" className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => {
                    if (!isFiltered) {
                      void loadLatestNewsWithPagination(totalPages);
                    }
                    setCurrentPage(totalPages);
                    updateURL(undefined, totalPages);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  {totalPages}
                </button>
              );
            }
            return pages;
          })()}
        </div>
        
        <button
          onClick={() => {
            const newPage = Math.min(totalPages, currentPage + 1);
            if (!isFiltered) {
              void loadLatestNewsWithPagination(newPage);
            }
            setCurrentPage(newPage);
            updateURL(undefined, newPage);
          }}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Pagina următoare"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const currentItems = getCurrentPageItems();

  return (
    <section className="space-y-8">
      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 order-1">
          {isLoading ? (
            <article className="mb-8 animate-pulse">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="h-48 rounded bg-gray-200 md:h-full" />
                <div className="md:col-span-2 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-full" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-28" />
                  </div>
                </div>
              </div>
            </article>
          ) : featured && (
            <article className="mb-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:hidden">
                <div className="h-48 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 md:h-full flex items-center justify-center">
                  {(() => {
                    const Icon = getLucideIconForContent(featured.content, Landmark);
                    return <Icon className="h-16 w-16 text-white" />;
                  })()}
                </div>
                <div className="md:col-span-2">
                  <h2 className="mb-3 text-xl font-bold">
                    <Link 
                      href={`/stiri/${createNewsSlug(featured.title, featured.id)}`} 
                      className="hover:underline"
                      onClick={() => handleNewsClick(featured, 'featured')}
                    >
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="mb-4 text-gray-600 leading-relaxed">
                    {getSummary(featured.content).slice(0, 300) + '...'}
                  </p>
                  <div className="mb-4 text-sm text-gray-500">
                    {formatDate(featured.publicationDate)}
                  </div>
                  <Citation {...getCitationFields(featured.content, featured.filename)} />
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="float-left mr-6 mb-4">
                  <div className="h-48 w-64 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 flex items-center justify-center">
                    {(() => {
                      const Icon = getLucideIconForContent(featured.content, Landmark);
                      return <Icon className="h-16 w-16 text-white" />;
                    })()}
                  </div>
                </div>
                <div>
                  <h2 className="mb-3 text-xl font-bold">
                    <Link 
                      href={`/stiri/${createNewsSlug(featured.title, featured.id)}`} 
                      className="hover:underline"
                      onClick={() => handleNewsClick(featured, 'featured')}
                    >
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="mb-4 text-gray-600 leading-relaxed">
                    {getSummary(featured.content).slice(0, 880) + '...'}
                  </p>
                  <div className="mb-4 text-sm text-gray-500">
                    {formatDate(featured.publicationDate)}
                  </div>
                  <Citation {...getCitationFields(featured.content, featured.filename)} />
                </div>
                <div className="clear-left"></div>
              </div>
            </article>
          )}
        </div>

        <div className="hidden lg:block absolute left-[calc(66.666667%-1px)] top-0 bottom-0 w-px bg-gray-200/60"></div>

        <div className="space-y-6 order-3 lg:order-2 hidden lg:block">
          <MostReadNewsSection />
        </div>
      </div>

      <div className="border-t border-gray-200/60 pt-8"></div>

      <div className="space-y-6 order-2 lg:order-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {isFiltered ? 'Știri după dată' : 'Știri recente'}
            </h3>
            {isFiltered && (
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <span>pentru</span>
                <span className="font-medium text-brand-accent">
                  {formatDate(selectedDate)}
                </span>
              </div>
            )}
          </div>
          
          <div className={`flex items-center gap-3 ${isFiltered ? 'w-full md:w-auto' : ''}`}>
            <div className={`relative ${isFiltered ? 'flex-1 md:flex-initial' : ''}`}>
              <BusinessDayDatePicker
                value={selectedDate}
                onChange={handleDateChangeFlow}
                buttonClassName="h-10 w-full pr-10"
              />
              {isFiltered && (
                <button
                  onClick={clearDateFilter}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Elimină filtrarea după dată"
                  title="Elimină filtrarea după dată"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Items per page dropdown - doar pentru utilizatorii cu subscripție activă */}
            {isAuthenticated && hasPremiumAccess && (
              <div className="relative">
                <button
                  onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
                  className="flex items-center gap-2 px-3 py-2 h-10 text-sm border border-brand-accent/30 rounded-md bg-white hover:bg-brand-accent/5 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-colors"
                  aria-label="Selectează numărul de items per pagină"
                >
                  <BookOpen className="h-4 w-4 text-brand-accent" />
                  <span className="text-gray-700">{itemsPerPage} items</span>
                  <ChevronDown className="h-4 w-4 text-brand-accent" />
                </button>
                
                {showItemsPerPageDropdown && (
                  <>
                    {/* Backdrop pentru a închide dropdown-ul */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowItemsPerPageDropdown(false)}
                    />
                    
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-brand-accent/20 rounded-md shadow-lg z-20">
                      {itemsPerPageOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleItemsPerPageChange(option)}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors first:rounded-t-md last:rounded-b-md ${
                            itemsPerPage === option 
                              ? 'bg-brand-accent text-white hover:bg-brand-accent/90' 
                              : 'text-gray-700 hover:bg-brand-accent/10 hover:text-brand-accent'
                          }`}
                        >
                          {option} items
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Se încarcă...</div>
          </div>
        ) : (
          <>
            {renderPagination()}
            
            <div className="divide-y">
              {currentItems.map((n, idx) => (
                <div key={n.id}>
                  <article className="flex gap-3 py-4">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 flex items-center justify-center">
                        {(() => {
                          const Icon = getLucideIconForContent(n.content, Gavel);
                          return <Icon className="h-6 w-6 text-white" />;
                        })()}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {formatDate(n.publicationDate)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="mb-2 font-semibold">
                        <Link 
                          href={`/stiri/${createNewsSlug(n.title, n.id)}`} 
                          className="hover:underline"
                          onClick={() => handleNewsClick(n, 'latest_news')}
                        >
                          {n.title}
                        </Link>
                      </h4>
                      <p className="line-clamp-2 text-sm text-gray-600 mb-2">{getSummary(n.content).slice(0, 380)}...</p>
                      <div className="mt-1 text-xs text-gray-600">
                        <Citation {...getCitationFields(n.content, n.filename)} />
                      </div>
                    </div>
                  </article>

                  {/*{idx === 4 && (
                    <div className="py-3">
                      <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-gray-700">
                          <Mail className="h-4 w-4 text-brand-accent" />
                          <span>Primește cele mai noi acte și decizii pe email</span>
                        </div>
                        <button
                          type="button"
                          onClick={showNewsletterModal}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-800 hover:bg-gray-100 hover:border-gray-400 transition-colors whitespace-nowrap"
                        >
                          Abonează-te
                        </button>
                      </div>
                    </div>
                  )}*/}
                </div>
              ))}
            </div>

            <div className="mt-6">
              {renderPagination()}
            </div>

            {currentItems.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {isFiltered 
                    ? `Nu s-au găsit știri pentru data ${formatDate(selectedDate)}`
                    : 'Nu s-au găsit știri'
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="block lg:hidden">
        <MostReadNewsSection />
      </div>
    </section>
  );
}
