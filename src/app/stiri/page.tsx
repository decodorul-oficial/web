'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { searchStiriByKeywords } from '@/features/news/services/newsService';
import { NewsItem } from '@/features/news/types';
import { Search, Filter, Bell, Calendar, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createNewsSlug } from '@/lib/utils/slugify';
import { SearchStiriByKeywordsParams } from '@/features/news/types';

function StiriPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State pentru filtrare
  const [keywords, setKeywords] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [orderBy, setOrderBy] = useState('publicationDate');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // State pentru rezultate
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  
  // State pentru notificări
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Inițializare din URL params
  useEffect(() => {
    const urlKeywords = searchParams.get('keywords');
    const urlOrderBy = searchParams.get('orderBy');
    const urlOrderDirection = searchParams.get('orderDirection');
    const urlDateFrom = searchParams.get('dateFrom');
    const urlDateTo = searchParams.get('dateTo');
    
    if (urlKeywords) {
      const decodedKeywords = decodeURIComponent(urlKeywords).split(',').filter(k => k.trim());
      setKeywords(decodedKeywords);
      setSearchInput(decodedKeywords.join(', '));
    }
    
    if (urlOrderBy) setOrderBy(urlOrderBy);
    if (urlOrderDirection) setOrderDirection(urlOrderDirection as 'asc' | 'desc');
    if (urlDateFrom) setDateFrom(urlDateFrom);
    if (urlDateTo) setDateTo(urlDateTo);
  }, [searchParams]);

  // Funcția de căutare
  const performSearch = useCallback(async (page: number = 1) => {
    if (keywords.length === 0) return;
    
    setLoading(true);
    try {
      const offset = (page - 1) * 20;
      
      // Construim parametrii pentru căutare
      const searchParams: SearchStiriByKeywordsParams = {
        keywords,
        limit: 20,
        offset,
        orderBy,
        orderDirection
      };
      
      // Adăugăm filtrele de dată dacă sunt setate
      if (dateFrom) {
        searchParams.publicationDateFrom = dateFrom;
      }
      if (dateTo) {
        searchParams.publicationDateTo = dateTo;
      }
      
      const result = await searchStiriByKeywords(searchParams);
      
      setNews(result.stiri);
      setPagination({
        totalCount: result.pagination.totalCount,
        currentPage: page,
        totalPages: result.pagination.totalPages,
        hasNextPage: result.pagination.hasNextPage,
        hasPreviousPage: result.pagination.hasPreviousPage
      });
    } catch (error) {
      console.error('Error searching news:', error);
      setNews([]);
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
  }, [keywords, orderBy, orderDirection, dateFrom, dateTo]);

  // Efect pentru căutare automată când se schimbă filtrele
  useEffect(() => {
    if (keywords.length > 0) {
      performSearch(1);
    }
  }, [performSearch, keywords.length]);

  // Actualizare URL când se schimbă filtrele
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (keywords.length > 0) {
      params.set('keywords', encodeURIComponent(keywords.join(',')));
    }
    if (orderBy !== 'publicationDate') params.set('orderBy', orderBy);
    if (orderDirection !== 'desc') params.set('orderDirection', orderDirection);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    
    const newURL = params.toString() ? `?${params.toString()}` : '/stiri';
    router.push(newURL);
  }, [keywords, orderBy, orderDirection, dateFrom, dateTo, router]);

  // Handler pentru căutare
  const handleSearch = () => {
    const newKeywords = searchInput.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setKeywords(newKeywords);
    // Nu apelăm updateURL() aici pentru a evita problema cu redirectarea
    // Vom apela performSearch direct
    if (newKeywords.length > 0) {
      performSearch(1);
    }
  };

  // Handler pentru aplicarea filtrelor
  const handleApplyFilters = () => {
    updateURL();
    if (keywords.length > 0) {
      performSearch(1);
    }
  };

  // Handler pentru notificări
  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  // Handler pentru paginare
  const handlePageChange = (page: number) => {
    performSearch(page);
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
              Caută și filtrează știrile din Decodorul Oficial după cuvinte cheie, dată și alte criterii
            </p>
          </div>

          {/* Panou de filtrare */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Căutare după keywords */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Caută după cuvinte cheie
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="search"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Ex: Ministerul Afacerilor Interne, strategie, lege..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-6 py-2 bg-brand-info text-white rounded-md hover:bg-brand-highlight transition-colors"
                  >
                    Caută
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Introduce cuvinte cheie separate prin virgulă. Toate cuvintele trebuie să fie prezente în știre.
                </p>
              </div>

              {/* Filtre de sortare și direcție */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orderBy" className="block text-sm font-medium text-gray-700 mb-2">
                    Ordonează după
                  </label>
                  <select
                    id="orderBy"
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="publicationDate">Data publicării</option>
                    <option value="title">Titlu</option>
                    <option value="viewCount">Numărul de vizualizări</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="orderDirection" className="block text-sm font-medium text-gray-700 mb-2">
                    Direcția
                  </label>
                  <select
                    id="orderDirection"
                    value={orderDirection}
                    onChange={(e) => setOrderDirection(e.target.value as 'asc' | 'desc')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="desc">Descrescător</option>
                    <option value="asc">Crescător</option>
                  </select>
                </div>
              </div>

              {/* Filtre de dată */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-2">
                    De la data
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                
                <div>
                  <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-2">
                    Până la data
                  </label>
                  <input
                    type="date"
                    id="dateTo"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              {/* Notificări și aplicare filtre */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <button
                  onClick={handleNotificationToggle}
                  disabled
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    notificationsEnabled
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Bell className="h-4 w-4" />
                  {notificationsEnabled ? 'Notificări activate' : 'Activează notificări'}
                </button>
                
                <button
                  onClick={handleApplyFilters}
                  className="px-6 py-2 bg-brand-info text-white rounded-md hover:bg-brand-highlight transition-colors flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Aplică filtrele
                </button>
              </div>
            </div>
          </div>

          {/* Rezultatele căutării */}
          {keywords.length > 0 && (
            <div className="space-y-6">
              {/* Header rezultate */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Rezultate pentru: {keywords.join(', ')}
                  </h2>
                  <p className="text-gray-600">
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
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Mesaj când nu sunt rezultate */}
              {!loading && news.length === 0 && keywords.length > 0 && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nu s-au găsit rezultate</h3>
                  <p className="text-gray-600">
                    Nu s-au găsit știri care să conțină toate cuvintele cheie: {keywords.join(', ')}
                  </p>
                  <p className="text-gray-500 mt-2">
                    Încearcă să modifici cuvintele cheie sau să elimini unele dintre ele.
                  </p>
                </div>
              )}

              {/* Paginare */}
              {!loading && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Pagina {pagination.currentPage} din {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mesaj inițial când nu s-a făcut nicio căutare */}
          {keywords.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Începe să cauți știri</h3>
              <p className="text-gray-600">
                Folosește filtrele de mai sus pentru a găsi știrile care te interesează.
              </p>
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
