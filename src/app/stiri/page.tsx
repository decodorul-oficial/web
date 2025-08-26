'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { searchStiriByKeywords } from '@/features/news/services/newsService';
import { NewsItem } from '@/features/news/types';
import { Search, Filter, Bell, Calendar, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createNewsSlug } from '@/lib/utils/slugify';
import { SearchStiriByKeywordsParams } from '@/features/news/types';
import BusinessDayDatePicker from '@/components/ui/BusinessDayDatePicker';
import { ShareButtons } from '@/components/ui/ShareButtons';

function StiriPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Schema.org structured data for news search page
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Căutare Avansată Știri Legislative | Decodorul Oficial",
    "description": "Caută și filtrează știrile legislative din Monitorul Oficial al României. Căutare avansată după cuvinte cheie, perioade și categorii.",
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/stiri`,
    "mainEntity": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/stiri?query={search_term_string}&keywords={keywords}&dateFrom={date_from}&dateTo={date_to}`
      },
      "query-input": "required name=search_term_string"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Acasă",
          "item": process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Căutare Avansată",
          "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/stiri`
        }
      ]
    },
    "inLanguage": "ro",
    "isAccessibleForFree": true,
    "genre": "legal information"
  };
  
  // State pentru filtrare îmbunătățită
  const [searchQuery, setSearchQuery] = useState(''); // Fuzzy/full-text search
  const [keywords, setKeywords] = useState<string[]>([]); // Exact keywords from content.keywords
  const [searchInput, setSearchInput] = useState(''); // Input field for main search
  const [keywordsInput, setKeywordsInput] = useState(''); // Input field for keywords
  const [orderBy, setOrderBy] = useState('publicationDate');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // State pentru rezultate
  const [news, setNews] = useState<NewsItem[]>([]);
  const [allNews, setAllNews] = useState<NewsItem[]>([]); // Toate rezultatele pentru paginare pe client
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  
  const itemsPerPage = 10; // Numărul de rezultate per pagină
  


  // Funcții pentru gestionarea inputurilor de dată
  const handleDateFromChange = (date: string) => {
    setDateFrom(date);
  };

  const handleDateToChange = (date: string) => {
    setDateTo(date);
  };

  // Funcții pentru resetarea inputurilor de dată
  const resetDateFrom = () => {
    setDateFrom('');
  };

  const resetDateTo = () => {
    setDateTo('');
  };

  // Inițializare din URL params
  useEffect(() => {
    const urlQuery = searchParams.get('query');
    const urlKeywords = searchParams.get('keywords');
    const urlOrderBy = searchParams.get('orderBy');
    const urlOrderDirection = searchParams.get('orderDirection');
    const urlDateFrom = searchParams.get('dateFrom');
    const urlDateTo = searchParams.get('dateTo');
    
    if (urlQuery) {
      setSearchQuery(decodeURIComponent(urlQuery));
      setSearchInput(decodeURIComponent(urlQuery));
    }
    
    if (urlKeywords) {
      const decodedKeywords = decodeURIComponent(urlKeywords).split(',').filter(k => k.trim());
      setKeywords(decodedKeywords);
      setKeywordsInput(decodedKeywords.join(', '));
    }
    
    if (urlOrderBy) setOrderBy(urlOrderBy);
    if (urlOrderDirection) setOrderDirection(urlOrderDirection as 'asc' | 'desc');
    if (urlDateFrom) setDateFrom(urlDateFrom);
    if (urlDateTo) setDateTo(urlDateTo);
  }, [searchParams]);

  // Funcția de căutare îmbunătățită
  const performSearch = useCallback(async (page: number = 1) => {
    // Allow search if any filter is applied: query, keywords, or date range
    if (!searchQuery && keywords.length === 0 && !dateFrom && !dateTo) return;
    
    setLoading(true);
    try {
      // Pentru paginarea pe client, luăm toate rezultatele
      const searchParams: SearchStiriByKeywordsParams = {
        limit: 1000, // Luăm toate rezultatele pentru paginare pe client
        offset: 0,
        orderBy,
        orderDirection
      };
      
      // Adăugăm query-ul fuzzy/full-text dacă este setat
      if (searchQuery && searchQuery.trim()) {
        searchParams.query = searchQuery.trim();
      }
      
      // Adăugăm keywords-urile exacte dacă sunt setate
      if (keywords.length > 0) {
        searchParams.keywords = keywords;
      }
      
      // Adăugăm filtrele de dată dacă sunt setate
      if (dateFrom) {
        searchParams.publicationDateFrom = dateFrom;
      }
      if (dateTo) {
        searchParams.publicationDateTo = dateTo;
      }
      
      const result = await searchStiriByKeywords(searchParams);
      
      // Salvăm toate rezultatele
      setAllNews(result.stiri);
      
      // Calculăm paginarea pe client
      const totalCount = result.stiri.length;
      const totalPages = Math.ceil(totalCount / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageItems = result.stiri.slice(startIndex, endIndex);
      
      setNews(currentPageItems);
      setPagination({
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      });
    } catch (error) {
      console.error('Error searching news:', error);
      setNews([]);
      setAllNews([]);
      setPagination({
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, keywords, orderBy, orderDirection, dateFrom, dateTo, itemsPerPage]);

  // Efect pentru căutare automată când se schimbă filtrele
  useEffect(() => {
    if (searchQuery || keywords.length > 0 || dateFrom || dateTo) {
      performSearch(1);
    }
  }, [performSearch, searchQuery, keywords.length, dateFrom, dateTo]);

  // Actualizare URL când se schimbă filtrele
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery && searchQuery.trim()) {
      params.set('query', encodeURIComponent(searchQuery.trim()));
    }
    if (keywords.length > 0) {
      params.set('keywords', encodeURIComponent(keywords.join(',')));
    }
    if (orderBy !== 'publicationDate') params.set('orderBy', orderBy);
    if (orderDirection !== 'desc') params.set('orderDirection', orderDirection);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    
    const newURL = params.toString() ? `?${params.toString()}` : '/stiri';
    router.push(newURL);
  }, [searchQuery, keywords, orderBy, orderDirection, dateFrom, dateTo, router]);

  // Handler pentru căutare text (fuzzy/full-text)
  const handleTextSearch = () => {
    setSearchQuery(searchInput.trim());
    if (searchInput.trim()) {
      performSearch(1);
    }
  };

  // Handler pentru căutare keywords
  const handleKeywordsSearch = () => {
    const newKeywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setKeywords(newKeywords);
    if (newKeywords.length > 0) {
      performSearch(1);
    }
  };

  // Handler pentru aplicarea filtrelor
  const handleApplyFilters = () => {
    updateURL();
    if (searchQuery || keywords.length > 0 || dateFrom || dateTo) {
      performSearch(1);
    }
  };



  // Handler pentru paginare
  const handlePageChange = (page: number) => {
    if (allNews.length === 0) return;
    
    // Calculăm paginarea pe client
    const totalCount = allNews.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageItems = allNews.slice(startIndex, endIndex);
    
    setNews(currentPageItems);
    setPagination({
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    });
  };

  // Formatare dată
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Extragere keywords din content
  const extractKeywords = (content: unknown): string[] => {
    if (!content || typeof content !== 'object') return [];
    const c = content as Record<string, unknown>;
    return Array.isArray(c?.keywords) ? c.keywords as string[] : [];
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData)
        }}
      />
      
      <Header />
      
      <main className="container-responsive flex-1 py-8" role="main">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-brand-info hover:underline">
                Acasă
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600" aria-current="page">
              Știri
            </li>
          </ol>
        </nav>

        <div className="space-y-8">
          {/* Header cu titlu și descriere */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Știri și Actualizări Legislative Partile I și II
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Caută și filtrează știrile din Decodorul Oficial cu căutare inteligentă, keywords exacte și filtre de dată
            </p>
          </div>

          {/* Panou de căutare compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Linia principală de căutare */}
            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              {/* Căutare text principală */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                    placeholder="Căutare text: guvern decision, hotarare, legislatie..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent text-base"
                  />
                </div>
              </div>
              
              {/* Keywords exacte */}
              <div className="flex-1">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleKeywordsSearch()}
                    placeholder="Keywords exacte: legislatie, finante..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent text-base"
                  />
                </div>
              </div>
              
              {/* Buton căutare */}
              <button
                onClick={() => {
                  handleTextSearch();
                  handleKeywordsSearch();
                }}
                className="px-6 py-2.5 bg-brand-info text-white rounded-md hover:bg-brand-highlight transition-colors whitespace-nowrap"
              >
                <Search className="h-4 w-4 inline mr-2" />
                Caută
              </button>
            </div>

            {/* Filtre avansate (collapse) */}
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 py-2">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtre avansate
                </span>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Data de la */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">De la data</label>
                    <div className="flex items-center">
                      <BusinessDayDatePicker
                        className="flex-1"
                        value={dateFrom}
                        onChange={handleDateFromChange}
                        popoverAlign="left"
                        buttonClassName="w-full h-11 py-2.5"
                        disableWeekends={true}
                        disableFuture={true}
                      />
                      {dateFrom && (
                        <button
                          onClick={resetDateFrom}
                          className="ml-1 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Data până la */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Până la data</label>
                    <div className="flex items-center">
                      <BusinessDayDatePicker
                        className="flex-1"
                        value={dateTo}
                        onChange={handleDateToChange}
                        popoverAlign="left"
                        buttonClassName="w-full h-11 py-2.5"
                        disableWeekends={true}
                        disableFuture={true}
                        min={dateFrom || undefined}
                      />
                      {dateTo && (
                        <button
                          onClick={resetDateTo}
                          className="ml-1 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Sortare */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sortare</label>
                    <select
                      value={orderBy}
                      onChange={(e) => setOrderBy(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent"
                    >
                      <option value="publicationDate">Data publicării</option>
                      <option value="title">Titlu</option>
                      <option value="viewCount">Vizualizări</option>
                    </select>
                  </div>
                  
                  {/* Direcție */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Direcție</label>
                    <select
                      value={orderDirection}
                      onChange={(e) => setOrderDirection(e.target.value as 'asc' | 'desc')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent"
                    >
                      <option value="desc">Descrescător</option>
                      <option value="asc">Crescător</option>
                    </select>
                  </div>
                </div>
                
                {/* Buton aplicare filtre */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Filter className="h-3 w-3" />
                    Aplică filtrele
                  </button>
                </div>
              </div>
            </details>
          </div>

          {/* Rezultatele căutării */}
          {(searchQuery || keywords.length > 0 || dateFrom || dateTo) && (
            <div className="space-y-6">
              {/* Header rezultate */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Rezultate pentru căutarea:
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      {searchQuery && (
                        <div>
                          <span className="font-medium text-blue-700">Text: </span>
                          <span className="bg-blue-100 px-2 py-1 rounded">{searchQuery}</span>
                        </div>
                      )}
                      {keywords.length > 0 && (
                        <div>
                          <span className="font-medium text-green-700">Keywords: </span>
                          {keywords.map(keyword => (
                            <span key={keyword} className="bg-green-100 px-2 py-1 rounded mr-1">{keyword}</span>
                          ))}
                        </div>
                      )}
                      {(dateFrom || dateTo) && (
                        <div>
                          <span className="font-medium text-purple-700">Perioada: </span>
                          <span className="bg-purple-100 px-2 py-1 rounded">
                            {(() => {
                              // Helper to format YYYY-MM-DD to DD.MM.YYYY
                              const formatDate = (dateStr: string) => {
                                if (!dateStr) return '';
                                const [year, month, day] = dateStr.split('-');
                                if (!year || !month || !day) return dateStr;
                                return `${day}.${month}.${year}`;
                              };
                              if (dateFrom && dateTo) {
                                return `De la ${formatDate(dateFrom)} - Până la ${formatDate(dateTo)}`;
                              } else if (dateFrom) {
                                return `Din ${formatDate(dateFrom)}`;
                              } else {
                                return `Până la ${formatDate(dateTo)}`;
                              }
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {pagination.totalCount} știri găsite
                  </p>
                </div>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
                  <p className="mt-4 text-gray-600">Se caută știrile...</p>
                </div>
              )}

              {/* Lista de știri */}
              {!loading && news.length > 0 && (
                <div className="space-y-4">
                  {news.map((item) => (
                    <article
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          <Link
                            href={`/stiri/${createNewsSlug(item.title, item.id)}`}
                            className="hover:text-brand transition-colors"
                          >
                            {item.title}
                          </Link>
                        </h3>

                        {/* Sumarul știrii */}
                        {(() => {
                          let summary = '';
                          if (
                            item.content &&
                            typeof item.content === 'object' &&
                            'summary' in item.content &&
                            typeof (item.content as any).summary === 'string'
                          ) {
                            summary = (item.content as any).summary;
                          }
                          // Trunchiem la 200 caractere și adăugăm "..."
                          if (summary.length > 300) {
                            summary = summary.slice(0, 300) + '...';
                          } else if (summary.length > 0) {
                            summary = summary;
                          }
                          return summary ? (
                            <p className="text-gray-700 text-sm">{summary}</p>
                          ) : null;
                        })()}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <time dateTime={item.publicationDate} className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.publicationDate)}
                          </time>
                          
                          {item.viewCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {item.viewCount} vizualizări
                            </span>
                          )}
                        </div>

                        {/* Keywords din știre */}
                        {(() => {
                          const itemKeywords = extractKeywords(item.content);
                          return itemKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {itemKeywords.map((keyword) => (
                                <Link
                                  key={keyword}
                                  href={`/stiri?keywords=${encodeURIComponent(keyword)}`}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                >
                                  {keyword}
                                </Link>
                              ))}
                            </div>
                          ) : null;
                        })()}

                        {/* Share buttons for each news item */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            Distribuie:
                          </div>
                          <ShareButtons
                            url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro'}/stiri/${createNewsSlug(item.title, item.id)}`}
                            title={item.title}
                            description={(() => {
                              let summary = '';
                              if (
                                item.content &&
                                typeof item.content === 'object' &&
                                'summary' in item.content &&
                                typeof (item.content as any).summary === 'string'
                              ) {
                                summary = (item.content as any).summary;
                              }
                              return summary || item.title;
                            })()}
                            variant="horizontal"
                            showLabels={false}
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Mesaj când nu sunt rezultate */}
              {!loading && news.length === 0 && (searchQuery || keywords.length > 0 || dateFrom || dateTo) && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nu s-au găsit rezultate</h3>
                  <div className="text-gray-600 space-y-2">
                    {searchQuery && (
                      <p>Nu s-au găsit știri pentru căutarea text: <span className="font-medium">"{searchQuery}"</span></p>
                    )}
                    {keywords.length > 0 && (
                      <p>Nu s-au găsit știri cu keywords-urile: <span className="font-medium">{keywords.join(', ')}</span></p>
                    )}
                    {(dateFrom || dateTo) && (
                      <p>
                        Nu s-au găsit știri în perioada
                        {dateFrom && dateTo 
                          ? ` ${dateFrom} - ${dateTo}`
                          : dateFrom 
                            ? ` din ${dateFrom}`
                            : ` până la ${dateTo}`
                        }
                      </p>
                    )}
                  </div>
                  <div className="text-gray-500 mt-4 space-y-1">
                    <p>Sugestii:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Încearcă termeni mai generali în căutarea text</li>
                      <li>• Verifică dacă keywords-urile sunt corecte</li>
                      <li>• Extinde perioada de căutare</li>
                      <li>• Combină diferite tipuri de filtre</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Paginare */}
              {!loading && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="Pagina anterioară"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
                      
                      // Ajustăm startPage dacă nu avem suficiente pagini la sfârșit
                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }

                      // Prima pagină
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => handlePageChange(1)}
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
                            onClick={() => handlePageChange(i)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              i === pagination.currentPage
                                ? 'bg-brand-accent text-white font-medium'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      // Ultima pagină
                      if (endPage < pagination.totalPages) {
                        if (endPage < pagination.totalPages - 1) {
                          pages.push(
                            <span key="ellipsis2" className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        
                        pages.push(
                          <button
                            key={pagination.totalPages}
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                          >
                            {pagination.totalPages}
                          </button>
                        );
                      }

                      return pages;
                    })()}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="Pagina următoare"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mesaj inițial când nu s-a făcut nicio căutare */}
          {!searchQuery && keywords.length === 0 && !dateFrom && !dateTo && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Începe să cauți știri</h3>
              <p className="text-gray-600 mb-6">
                Folosește bara de căutare de mai sus pentru a găsi știrile care te interesează.
              </p>
              <div className="max-w-lg mx-auto bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span><strong>Căutare text:</strong> guvern, hotarare, legislatie</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span><strong>Keywords exacte:</strong> educatie, finante</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span><strong>Filtre avansate:</strong> periode, sortare</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function StiriPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8" role="main">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-gray-600">Se încarcă pagina...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <StiriPageContent />
    </Suspense>
  );
}
