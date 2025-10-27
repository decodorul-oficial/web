'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { searchStiriByKeywords } from '@/features/news/services/newsService';
import { NewsItem } from '@/features/news/types';
import { Search, Filter, Calendar, Eye, X, ChevronLeft, ChevronRight, ChevronDown, Info, CheckCircle, AlertCircle, Share2 } from 'lucide-react';
import Link from 'next/link';
import { createNewsSlug } from '@/lib/utils/slugify';
import { SearchStiriByKeywordsParams } from '@/features/news/types';
import BusinessDayDatePicker from '@/components/ui/BusinessDayDatePicker';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { SaveSearchButton } from '@/components/saved-searches/SaveSearchButton';
import { SavedSearchesManager } from '@/components/saved-searches/SavedSearchesManager';
import { SearchParams } from '@/features/saved-searches/types';
import { compareSearchParams, hasSearchContent, normalizeSearchParams } from '@/lib/utils/searchComparison';
import { useAuth } from '@/components/auth/AuthProvider';

function StiriPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, hasPremiumAccess, loading } = useAuth();

  // Redirect non-premium users to homepage only after auth loading is complete
  useEffect(() => {
    // Wait for auth loading to complete before checking premium access
    if (loading) return;

    // Only redirect if hasPremiumAccess is definitively false (after loading is complete)
    if (hasPremiumAccess === false) {
      router.push('/');
      return;
    }
  }, [hasPremiumAccess, loading, router]);
  
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
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(true); // Open by default
  
  // State pentru rezultate
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  // State pentru parametrii originali de căutare (de la server)
  const [originalSearchParams, setOriginalSearchParams] = useState<SearchParams | null>(null);
  
  // State pentru dropdown-ul de share
  const [openShareDropdown, setOpenShareDropdown] = useState<string | null>(null);

  // Închide dropdown-ul când se face click în afara lui
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.share-dropdown-container')) {
        setOpenShareDropdown(null);
      }
    };

    if (openShareDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openShareDropdown]);
  
  const itemsPerPage = 10; // Numărul de rezultate per pagină
  
  // Key for sessionStorage
  const STORAGE_KEY = 'stiri-search-state';

  // Funcții pentru persistarea stării în sessionStorage
  const saveStateToStorage = useCallback(() => {
    const state = {
      searchQuery,
      keywords,
      searchInput,
      keywordsInput,
      orderBy,
      orderDirection,
      dateFrom,
      dateTo,
      isAdvancedFiltersOpen,
      pagination,
      timestamp: Date.now()
    };
    
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save state to sessionStorage:', error);
    }
  }, [searchQuery, keywords, searchInput, keywordsInput, orderBy, orderDirection, dateFrom, dateTo, isAdvancedFiltersOpen, pagination]);

  // Funcție pentru restaurarea stării din sessionStorage
  const restoreStateFromStorage = useCallback(() => {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Verificăm dacă starea nu este prea veche (mai mult de 24 ore)
        const maxAge = 24 * 60 * 60 * 1000; // 24 ore în milisecunde
        if (Date.now() - state.timestamp > maxAge) {
          sessionStorage.removeItem(STORAGE_KEY);
          return false;
        }
        
        // Restaurăm starea
        if (state.searchQuery !== undefined) setSearchQuery(state.searchQuery);
        if (state.keywords !== undefined) setKeywords(state.keywords);
        if (state.searchInput !== undefined) setSearchInput(state.searchInput);
        if (state.keywordsInput !== undefined) setKeywordsInput(state.keywordsInput);
        if (state.orderBy !== undefined) setOrderBy(state.orderBy);
        if (state.orderDirection !== undefined) setOrderDirection(state.orderDirection);
        if (state.dateFrom !== undefined) setDateFrom(state.dateFrom);
        if (state.dateTo !== undefined) setDateTo(state.dateTo);
        if (state.isAdvancedFiltersOpen !== undefined) setIsAdvancedFiltersOpen(state.isAdvancedFiltersOpen);
        if (state.pagination !== undefined) setPagination(state.pagination);
        
        return true;
      }
    } catch (error) {
      console.warn('Failed to restore state from sessionStorage:', error);
      sessionStorage.removeItem(STORAGE_KEY);
    }
    return false;
  }, []);

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

  // Inițializare din URL params sau sessionStorage
  useEffect(() => {
    const urlHasParams = searchParams.toString() !== '';

    // PRIORITATE 1: Dacă URL-ul conține parametri, el este sursa de adevăr.
    if (urlHasParams) {
        const urlQuery = searchParams.get('query');
        const urlKeywords = searchParams.get('keywords');
        const urlOrderBy = searchParams.get('orderBy');
        const urlOrderDirection = searchParams.get('orderDirection');
        const urlDateFrom = searchParams.get('dateFrom');
        const urlDateTo = searchParams.get('dateTo');
        const urlPage = searchParams.get('page');
        
        // Se actualizează starea DOAR cu valorile din URL
        if (urlQuery) {
            const decodedQuery = decodeURIComponent(urlQuery);
            setSearchQuery(decodedQuery);
            setSearchInput(decodedQuery);
        } else {
            setSearchQuery('');
            setSearchInput('');
        }
        
        if (urlKeywords) {
            const decodedKeywords = decodeURIComponent(urlKeywords).split(',').filter(k => k.trim());
            setKeywords(decodedKeywords);
            setKeywordsInput(decodedKeywords.join(', '));
        } else {
            setKeywords([]);
            setKeywordsInput('');
        }
        
        setOrderBy(urlOrderBy || 'publicationDate');
        setOrderDirection((urlOrderDirection as 'asc' | 'desc') || 'desc');
        
        // Validăm și setăm datele
        const dateFromFormatted = urlDateFrom?.match(/^\d{4}-\d{2}-\d{2}$/) ? urlDateFrom : '';
        setDateFrom(dateFromFormatted);
        
        const dateToFormatted = urlDateTo?.match(/^\d{4}-\d{2}-\d{2}$/) ? urlDateTo : '';
        setDateTo(dateToFormatted);

        // Setăm pagina curentă
        const pageNum = urlPage ? parseInt(urlPage, 10) : 1;
        setPagination(prev => ({
            ...prev,
            currentPage: pageNum > 0 ? pageNum : 1
        }));
        
        // Nu mai este nevoie să apelăm performSearch() aici.
        // Celălalt useEffect, care ascultă schimbările pe filtre (searchQuery, keywords, etc.),
        // se va declanșa automat și va porni căutarea.
      } 
      // PRIORITATE 2: Dacă URL-ul este gol, încercăm să restaurăm sesiunea anterioară.
      else {
          restoreStateFromStorage();
      }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]); // Rulăm acest efect doar când se schimbă parametrii URL.

  // Actualizare URL când se schimbă filtrele
  const updateURL = useCallback((currentPage: number) => {
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
    // Folosim argumentul `currentPage` în loc de starea `pagination.currentPage`
    if (currentPage > 1) {
        params.set('page', currentPage.toString());
    }
    
    const newURL = params.toString() ? `?${params.toString()}` : '/stiri';
    router.push(newURL);
    // Eliminăm `pagination.currentPage` din lista de dependențe
  }, [searchQuery, keywords, orderBy, orderDirection, dateFrom, dateTo, router]);

  // Funcția de căutare îmbunătățită cu paginare pe server
  const performSearch = useCallback(async (page: number = 1) => {
    const currentParams: SearchStiriByKeywordsParams = {
        query: searchQuery.trim() || undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
        publicationDateFrom: dateFrom || undefined,
        publicationDateTo: dateTo || undefined,
        orderBy,
        orderDirection
      };

    // Permitem căutarea doar dacă există cel puțin un filtru aplicat
    if (!hasSearchContent(currentParams)) return;
    
    setSearchLoading(true);
    try {
      // Calculăm offset-ul pentru pagina curentă
      const offset = (page - 1) * itemsPerPage;
      
      const apiParams: SearchStiriByKeywordsParams = {
        ...currentParams,
        limit: itemsPerPage,
        offset,
      };
      
      const result = await searchStiriByKeywords(apiParams);
      
      const totalPages = result.pagination.totalPages;
      if (page > totalPages && totalPages > 0) {
        updateURL(1); 
        return; 
      }
      
      setNews(result.stiri);
      setPagination(result.pagination);
      
      // LINIA PROBLEMATICĂ A FOST ELIMINATĂ DE AICI
      // Nu mai setăm `originalSearchParams` după o căutare nouă.
      // Acesta este setat DOAR când se aplică o căutare salvată sau se resetează.

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
      setSearchLoading(false);
    }
  }, [searchQuery, keywords, orderBy, orderDirection, dateFrom, dateTo, itemsPerPage, updateURL]);



  // Efect pentru căutare automată când se schimbă filtrele
  useEffect(() => {
    if (searchQuery || keywords.length > 0 || dateFrom || dateTo) {
      // Dacă avem paginare restaurată, folosim pagina curentă, altfel pagina 1
      const pageToSearch = pagination.currentPage > 1 ? pagination.currentPage : 1;
      performSearch(pageToSearch);
    }
  }, [performSearch, searchQuery, keywords.length, dateFrom, dateTo, pagination.currentPage]);

  // Efect pentru salvarea stării în sessionStorage
  useEffect(() => {
    // Salvăm starea doar dacă avem cel puțin un filtru aplicat
    if (searchQuery || keywords.length > 0 || dateFrom || dateTo) {
      saveStateToStorage();
    }
  }, [saveStateToStorage, searchQuery, keywords, dateFrom, dateTo, pagination]);

  // Efect pentru inițializarea Flowbite dropdowns
  useEffect(() => {
    // Import and initialize Flowbite dropdowns
    const initFlowbite = async () => {
      const { initDropdowns } = await import('flowbite');
      initDropdowns();
    };
    
    initFlowbite();
  }, []);

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
    const newPage = 1; // La aplicarea filtrelor, revenim mereu la prima pagină
    performSearch(newPage);
    updateURL(newPage);
  };

  // Handler pentru paginare - face request nou la API
  const handlePageChange = (page: number) => {
    // Facem request nou la API pentru pagina specificată
    performSearch(page);
    
    // Actualizăm URL-ul transmițând direct noua pagină
    updateURL(page);
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

  // Funcție pentru aplicarea unei căutări salvate
  const handleApplySavedSearch = (searchParams: SearchParams) => {
    // Resetează cache-ul și paginarea
    setNews([]);
    setPagination({
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    });

    // Setează parametrii de căutare
    if (searchParams.query) {
      setSearchQuery(searchParams.query);
      setSearchInput(searchParams.query);
    } else {
      setSearchQuery('');
      setSearchInput('');
    }

    if (searchParams.keywords && searchParams.keywords.length > 0) {
      setKeywords(searchParams.keywords);
      setKeywordsInput(searchParams.keywords.join(', '));
    } else {
      setKeywords([]);
      setKeywordsInput('');
    }

    if (searchParams.publicationDateFrom) {
      setDateFrom(searchParams.publicationDateFrom);
    } else {
      setDateFrom('');
    }

    if (searchParams.publicationDateTo) {
      setDateTo(searchParams.publicationDateTo);
    } else {
      setDateTo('');
    }

    if (searchParams.orderBy) {
      setOrderBy(searchParams.orderBy);
    }

    if (searchParams.orderDirection) {
      setOrderDirection(searchParams.orderDirection);
    }

    // Setăm parametrii originali de căutare pentru comparație
    setOriginalSearchParams({
      query: searchParams.query || undefined,
      keywords: searchParams.keywords || undefined,
      publicationDateFrom: searchParams.publicationDateFrom || undefined,
      publicationDateTo: searchParams.publicationDateTo || undefined,
      orderBy: searchParams.orderBy || undefined,
      orderDirection: searchParams.orderDirection || undefined
    });

    // Actualizează URL-ul cu parametrii noi
    const params = new URLSearchParams();
    if (searchParams.query && searchParams.query.trim()) {
      params.set('query', encodeURIComponent(searchParams.query.trim()));
    }
    if (searchParams.keywords && searchParams.keywords.length > 0) {
      params.set('keywords', encodeURIComponent(searchParams.keywords.join(',')));
    }
    if (searchParams.publicationDateFrom) {
      params.set('dateFrom', searchParams.publicationDateFrom);
    }
    if (searchParams.publicationDateTo) {
      params.set('dateTo', searchParams.publicationDateTo);
    }
    if (searchParams.orderBy && searchParams.orderBy !== 'publicationDate') {
      params.set('orderBy', searchParams.orderBy);
    }
    if (searchParams.orderDirection && searchParams.orderDirection !== 'desc') {
      params.set('orderDirection', searchParams.orderDirection);
    }
    
    const newURL = params.toString() ? `?${params.toString()}` : '/stiri';
    router.push(newURL);

    // Căutarea se va declanșa automat prin useEffect când se actualizează state-urile
  };

  // Funcție pentru obținerea parametrilor de căutare curenti
  const getCurrentSearchParams = (): SearchParams => {
    return {
      query: searchQuery || undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
      publicationDateFrom: dateFrom || undefined,
      publicationDateTo: dateTo || undefined,
      orderBy: orderBy !== 'publicationDate' ? orderBy : undefined,
      orderDirection: orderDirection !== 'desc' ? orderDirection : undefined
    };
  };

  // Funcție pentru obținerea statusului salvării
  const getSaveStatus = () => {
    // Dacă utilizatorul nu este autentificat sau nu are acces premium, nu afișăm mesajul
    if (!user || !hasPremiumAccess) {
      return { type: 'no-access', message: '' };
    }
    
    const currentParams = getCurrentSearchParams();
    const hasValidParams = hasSearchContent(currentParams);
    
    if (!hasValidParams) {
      return { type: 'no-content', message: 'Nu există parametri de căutare de salvat' };
    }
    
    if (originalSearchParams) {
      const hasChanges = !compareSearchParams(normalizeSearchParams(currentParams), originalSearchParams);
      if (!hasChanges) {
        return { type: 'no-changes', message: 'Modifică parametrii pentru a putea salva căutarea' };
      }
    }
    
    return { type: 'can-save', message: 'Căutarea poate fi salvată' };
  };

  // Funcție pentru trunchierea textului cu tooltip
  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Funcție pentru resetarea completă a formularului
  const handleResetAll = () => {
    setSearchQuery('');
    setKeywords([]);
    setSearchInput('');
    setKeywordsInput('');
    setOrderBy('publicationDate');
    setOrderDirection('desc');
    setDateFrom('');
    setDateTo('');
    setNews([]);
    setPagination({
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    });
    // LINIA CRITICĂ: Resetăm starea originală!
    setOriginalSearchParams(null); 
    
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
    // Clear URL parameters
    router.push('/stiri');
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
              Știri și Actualizări Legislative Partea I și II
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Caută și filtrează știrile din Decodorul Oficial cu căutare inteligentă, keywords exacte și filtre de dată
            </p>
          </div>

          {/* Panou de căutare compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Tab-uri pentru căutări salvate - lipit de container */}
            <div className="flex items-center justify-start gap-4 mb-4 -mt-4">
              <SavedSearchesManager
                onApplySearch={handleApplySavedSearch}
                className="text-sm"
              />
            </div>
            {/* Indicator de status pentru salvarea căutării */}
            {(() => {
              const saveStatus = getSaveStatus();
              if (saveStatus.type === 'no-content' || saveStatus.type === 'no-access') return null;
              
              return (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-4 ${
                  saveStatus.type === 'can-save' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200' 
                    : 'bg-gradient-to-r from-brand-info/10 to-brand-accent/10 border border-brand-info/20 text-brand-info'
                }`}>
                  {saveStatus.type === 'can-save' ? (
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{saveStatus.message}</span>
                </div>
              );
            })()}

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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent text-base relative z-80"
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent text-base relative z-80"
                  />
                </div>
              </div>
              
              {/* Butoane căutare și resetare */}
              <div className="flex gap-2">
                <div className="flex gap-1">
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
                  <SaveSearchButton
                    searchParams={getCurrentSearchParams()}
                    originalSearchParams={originalSearchParams || undefined}
                    variant="default"
                    size="sm"
                    showLabel={false}
                    className="px-3 py-2.5 bg-brand-info text-white rounded-md hover:bg-brand-highlight transition-colors"
                  />
                </div>
                <button
                  onClick={handleResetAll}
                  className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors whitespace-nowrap"
                  title="Resetează toate filtrele și rezultatele"
                >
                  <X className="h-4 w-4 inline mr-2" />
                  Reset
                </button>
              </div>
            </div>

            {/* Filtre avansate (controlled) className="border-t border-gray-200"*/}
            <div >
              {/* <button
                onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 py-2 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtre avansate
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedFiltersOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isAdvancedFiltersOpen && ( */}
                {/* border-t border-gray-200 */}
                <div className="mt-3 pt-3 ">
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
                          buttonClassName="w-full h-11 py-2.5 relative z-80"
                          disableWeekends={true}
                          disableFuture={true}
                          zIndex={100}
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
                          buttonClassName="w-full h-11 py-2.5 relative z-80"
                          disableWeekends={true}
                          disableFuture={true}
                          min={dateFrom || undefined}
                          zIndex={100}
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
                    
                    {/* Sortare - Flowbite Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Sortare</label>
                      <div className="relative">
                        <button
                          id="sortare-dropdown-button"
                          data-dropdown-toggle="sortare-dropdown"
                          className="w-full h-11 px-3 py-2.5 text-sm text-left text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-brand focus:border-transparent flex items-center justify-between relative z-80"
                          type="button"
                        >
                          {orderBy === 'publicationDate' ? 'Data publicării' : 
                           orderBy === 'title' ? 'Titlu' : 
                           orderBy === 'viewCount' ? 'Vizualizări' : 'Data publicării'}
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                        <div id="sortare-dropdown" className="z-80 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-full border border-gray-200">
                          <ul className="py-1 text-sm text-gray-700" aria-labelledby="sortare-dropdown-button">
                            <li>
                              <button
                                onClick={() => setOrderBy('publicationDate')}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${orderBy === 'publicationDate' ? 'bg-gray-100 font-medium' : ''}`}
                              >
                                Data publicării
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => setOrderBy('title')}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${orderBy === 'title' ? 'bg-gray-100 font-medium' : ''}`}
                              >
                                Titlu
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => setOrderBy('viewCount')}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${orderBy === 'viewCount' ? 'bg-gray-100 font-medium' : ''}`}
                              >
                                Vizualizări
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {/* Direcție - Flowbite Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Direcție</label>
                      <div className="relative">
                        <button
                          id="directie-dropdown-button"
                          data-dropdown-toggle="directie-dropdown"
                          className="w-full h-11 px-3 py-2.5 text-sm text-left text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-brand focus:border-transparent flex items-center justify-between relative z-80"
                          type="button"
                        >
                          {orderDirection === 'desc' ? 'Descrescător' : 'Crescător'}
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                        <div id="directie-dropdown" className="z-80 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-full border border-gray-200">
                          <ul className="py-1 text-sm text-gray-700" aria-labelledby="directie-dropdown-button">
                            <li>
                              <button
                                onClick={() => setOrderDirection('desc')}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${orderDirection === 'desc' ? 'bg-gray-100 font-medium' : ''}`}
                              >
                                Descrescător
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => setOrderDirection('asc')}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${orderDirection === 'asc' ? 'bg-gray-100 font-medium' : ''}`}
                              >
                                Crescător
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Buton aplicare filtre */}
                  {/* <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleApplyFilters}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Filter className="h-3 w-3" />
                      Aplică filtrele
                    </button>
                  </div> */}
                </div>
              {/* )} */}
            </div>
          </div>

          {/* Rezultatele căutării */}
          {(searchQuery || keywords.length > 0 || dateFrom || dateTo) && (
            <div className="space-y-6">
              {/* Header rezultate */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <span className="hidden lg:inline">
                      {pagination.totalCount} Rezultate pentru căutarea cu criteriile:
                      {searchQuery && (
                        <span className="ml-2">
                          <span className="text-xs font-medium text-blue-700">Text:</span>
                          <span 
                            className="bg-blue-100 px-2 py-1 rounded text-sm ml-1 cursor-help" 
                            title={searchQuery}
                          >
                            {truncateText(searchQuery, 15)}
                          </span>
                        </span>
                      )}
                      {keywords.length > 0 && (
                        <span className="ml-2">
                          <span className="text-xs font-medium text-green-700">Keywords:</span>
                          {keywords.map(keyword => (
                            <span 
                              key={keyword} 
                              className="bg-green-100 px-2 py-1 rounded text-sm ml-1 cursor-help"
                              title={keyword}
                            >
                              {truncateText(keyword, 12)}
                            </span>
                          ))}
                        </span>
                      )}
                      {(dateFrom || dateTo) && (
                        <span className="ml-2">
                          <span className="text-xs font-medium text-purple-700">Perioada:</span>
                          <span className="bg-purple-100 px-2 py-1 rounded text-sm ml-1">
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
                        </span>
                      )}
                    </span>
                    <span className="lg:hidden">
                      {pagination.totalCount} Rezultate pentru căutarea cu criteriile:
                    </span>
                  </h2>

                  {/* Layout pentru ecrane mici - mai multe linii */}
                  <div className="lg:hidden text-sm text-gray-600 space-y-1">
                    <div className="font-semibold text-gray-900 mb-2">
                      {pagination.totalCount} Rezultate pentru căutarea cu criteriile:
                    </div>
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
                </div>
              </div>

              {/* Loading state */}
              {searchLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
                  <p className="mt-4 text-gray-600">Se caută știrile...</p>
                </div>
              )}

              {/* Paginare */}
              {!searchLoading && pagination.totalPages > 1 && (
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
                      const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
                      
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

              {/* Lista de știri */}
              {!searchLoading && news.length > 0 && (
                <div className="space-y-4">
                  {news.map((item) => (
                    <article
                      key={item.id}
                      className="group bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 flex-1">
                            <Link
                              href={`/stiri/${createNewsSlug(item.title, item.id)}`}
                              className="hover:text-brand transition-colors"
                            >
                              {item.title}
                            </Link>
                          </h3>
                          <div className="flex-shrink-0 flex items-center gap-1">
                            <FavoriteButton
                              newsId={item.id}
                              newsTitle={item.title}
                              initialIsFavorite={item.isFavorite}
                              size="sm"
                              showLabel={false}
                              tooltipDirection="up"
                            />
                            <div className="relative share-dropdown-container">
                              <button
                                onClick={() => setOpenShareDropdown(openShareDropdown === item.id ? null : item.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                                title="Distribuie"
                                aria-label="Distribuie"
                              >
                                <Share2 className="w-4 h-4 text-gray-500 hover:text-brand transition-colors" />
                              </button>
                              
                              {/* Dropdown cu butoanele de share */}
                              {openShareDropdown === item.id && (
                                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px]">
                                  <div className="text-xs text-gray-500 mb-2 px-1">Distribuie:</div>
                                  <ShareButtons
                                    url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro'}/stiri/${createNewsSlug(item.title, item.id)}`}
                                    title={item.title}
                                    description={(() => {
                                      let summary = '';
                                      if (
                                        item.content &&
                                        typeof item.content === 'object' &&
                                        'summary' in item.content &&
                                        typeof (item.content as unknown as Record<string, unknown>).summary === 'string'
                                      ) {
                                        summary = (item.content as unknown as Record<string, unknown>).summary as string;
                                      }
                                      return summary || item.title;
                                    })()}
                                    variant="horizontal"
                                    showLabels={false}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Sumarul știrii */}
                        {(() => {
                          let summary = '';
                          if (
                            item.content &&
                            typeof item.content === 'object' &&
                            'summary' in item.content &&
                            typeof (item.content as unknown as Record<string, unknown>).summary === 'string'
                          ) {
                            summary = (item.content as unknown as Record<string, unknown>).summary as string;
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
              {!searchLoading && news.length === 0 && (searchQuery || keywords.length > 0 || dateFrom || dateTo) && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nu s-au găsit rezultate</h3>
                  <div className="text-gray-600 space-y-2">
                    {searchQuery && (
                      // eslint-disable-next-line react/no-unescaped-entities
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
              {!searchLoading && pagination.totalPages > 1 && (
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
                      const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
                      
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
