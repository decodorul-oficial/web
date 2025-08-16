'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchLatestNews, fetchNewsByDate } from '@/features/news/services/newsService';
import { Citation } from '@/components/legal/Citation';
import { stripHtml } from '@/lib/html/sanitize';
import { MostReadNewsSection } from './MostReadNewsSection';
import { Gavel, Landmark, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createNewsSlug } from '@/lib/utils/slugify';
import { trackNewsClick } from '../../../lib/analytics';
import type { NewsItem } from '@/features/news/types';

export function LatestNewsSection() {
  const [stiri, setStiri] = useState<NewsItem[]>([]);
  const [filteredStiri, setFilteredStiri] = useState<NewsItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [featured, setFeatured] = useState<NewsItem | null>(null);
  const [showDateInput, setShowDateInput] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    loadLatestNews();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadNewsByDate(selectedDate);
    } else {
      setIsFiltered(false);
      setCurrentPage(1);
      setFilteredStiri([]);
    }
  }, [selectedDate]);

  const loadLatestNews = async () => {
    try {
      setIsLoading(true);
      // Optimizat pentru a fi mai rapid
      const { stiri: newsData } = await fetchLatestNews({ limit: 100, orderBy: 'publicationDate', orderDirection: 'desc' });
      setStiri(newsData);
      if (newsData.length > 0) {
        setFeatured(newsData[0]);
      }
      setTotalPages(Math.ceil((newsData.length - 1) / itemsPerPage));
    } catch (error) {
      console.error('Error loading latest news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNewsByDate = async (date: string) => {
    try {
      setIsLoading(true);
      // Optimizat pentru a fi mai rapid
      const newsByDate = await fetchNewsByDate(date, undefined, 100);
      setFilteredStiri(newsByDate);
      setIsFiltered(true);
      setCurrentPage(1);
      setTotalPages(Math.ceil(newsByDate.length / itemsPerPage));
    } catch (error) {
      console.error('Error loading news by date:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    setShowDateInput(false); // Ascundem input-ul după selecție
  };

  const clearDateFilter = () => {
    setSelectedDate('');
    setIsFiltered(false);
    setCurrentPage(1);
    setFilteredStiri([]);
    setShowDateInput(false);
  };

  const toggleDateInput = () => {
    setShowDateInput(!showDateInput);
  };

  const openDateInput = () => {
    setShowDateInput(true);
  };

  const getCurrentPageItems = () => {
    if (isFiltered) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredStiri.slice(startIndex, startIndex + itemsPerPage);
    } else {
      // Pentru Latest News, afișăm știrile de la a 2-a încolo (prima este featured)
      const startIndex = (currentPage - 1) * itemsPerPage;
      return stiri.slice(startIndex + 1, startIndex + 1 + itemsPerPage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatSelectedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  function getSummary(content: unknown): string | undefined {
    if (!content) return undefined;
    try {
      const c = content as any;
      const raw = c.summary || c.body || c.text || (typeof c === 'string' ? c : undefined);
      return typeof raw === 'string' ? stripHtml(raw) : raw;
    } catch {
      return undefined;
    }
  }

  function getCitationFields(content: unknown) {
    const c = (content ?? {}) as any;
    return {
      act: c?.act || c?.actName || undefined,
      partea: c?.partea || 'Partea I',
      numarSiData: c?.monitorulOficial || c?.moNumberDate || undefined,
      sourceUrl: c?.sourceUrl || c?.url || undefined
    } as const;
  }

  const handleNewsClick = (news: NewsItem, section: string) => {
    trackNewsClick(news.id, news.title, section);
  };

  const currentItems = getCurrentPageItems();

  return (
    <section className="space-y-8">
      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoading ? (
            // Skeleton loader pentru știrea principală
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
          ) : featured ? (
            <article className="mb-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="h-48 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 md:h-full flex items-center justify-center">
                  <Landmark className="h-16 w-16 text-white" />
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
                  <p className="mb-4 text-gray-600">{getSummary(featured.content)?.slice(0, 350)}...</p>
                  <div className="mb-4 text-sm text-gray-500">
                    {formatDate(featured.publicationDate)}
                  </div>
                  <Citation {...getCitationFields(featured.content)} />
                </div>
              </div>
            </article>
          ) : null}
        </div>

        {/* Separator vertical subtil între stirea principală și Most Reads */}
        <div className="hidden lg:block absolute left-[calc(66.666667%-1px)] top-0 bottom-0 w-px bg-gray-200/60"></div>

        <div className="space-y-6">
          <MostReadNewsSection />
        </div>
      </div>

      {/* Separator orizontal subtil sub secțiunile principale */}
      <div className="border-t border-gray-200/60 pt-8"></div>

      <div className="space-y-6">
        <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          {/* Header și informații despre filtrare */}
          <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
            <h3 className="text-lg font-semibold">
              {isFiltered ? 'Știri după dată' : 'Latest News'}
            </h3>
            {isFiltered && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>pentru</span>
                <span className="font-medium text-brand-accent">
                  {formatSelectedDate(selectedDate)}
                </span>
              </div>
            )}
          </div>
          
          {/* Controale pentru dată */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {!showDateInput ? (
                <button
                  onClick={openDateInput}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent w-full sm:w-auto justify-center sm:justify-start"
                  title="Selectează o dată"
                >
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">
                    {selectedDate ? formatSelectedDate(selectedDate) : 'Selectează dată'}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent w-full sm:w-auto"
                    max={new Date().toISOString().split('T')[0]}
                    autoFocus
                  />
                </div>
              )}
            </div>
            {isFiltered && (
              <button
                onClick={clearDateFilter}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-50 sm:p-1 sm:border-0 sm:hover:bg-transparent"
                title="Anulează filtrarea"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Se încarcă...</div>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {currentItems.map((n) => (
                <article key={n.id} className="flex gap-3 py-4">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 flex items-center justify-center">
                      <Gavel className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 text-xs text-gray-500">
                      {formatDate(n.publicationDate)}
                    </div>
                    <h4 className="mb-2 font-semibold">
                      <Link 
                        href={`/stiri/${createNewsSlug(n.title, n.id)}`} 
                        className="hover:underline"
                        onClick={() => handleNewsClick(n, 'latest_news')}
                      >
                        {n.title}
                      </Link>
                    </h4>
                    <p className="line-clamp-2 text-sm text-gray-600 mb-2">{getSummary(n.content)?.slice(0, 180)}...</p>
                    <div>
                      <Citation {...getCitationFields(n.content)} />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    // Ajustăm startPage dacă nu avem suficiente pagini la sfârșit
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    // Prima pagină
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
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

                    // Paginile vizibile
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
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

                    // Ultima pagină
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
                          onClick={() => setCurrentPage(totalPages)}
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="Pagina următoare"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {currentItems.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {isFiltered 
                    ? `Nu s-au găsit știri pentru data ${formatSelectedDate(selectedDate)}`
                    : 'Nu s-au găsit știri'
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}


