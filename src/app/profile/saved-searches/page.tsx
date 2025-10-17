'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SavedSearchesList } from '@/components/saved-searches/SavedSearchesList';
import { SearchParams } from '@/features/saved-searches/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Bookmark, Star, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SavedSearchesPage() {
  const { user, hasPremiumAccess, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  // Redirect dacă utilizatorul nu este autentificat
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Afișează loading state în timpul verificării autentificării
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8" role="main">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-info mx-auto mb-4"></div>
            <p className="text-gray-600">Se verifică autentificarea...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Afișează loading dacă utilizatorul nu este încă autentificat
  if (!user) {
    return null;
  }

  const handleApplySearch = (searchParams: SearchParams) => {
    // Construiește URL-ul pentru căutare
    const params = new URLSearchParams();
    
    if (searchParams.query) {
      params.set('query', searchParams.query);
    }
    if (searchParams.keywords && searchParams.keywords.length > 0) {
      params.set('keywords', searchParams.keywords.join(','));
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

    const searchUrl = `/stiri?${params.toString()}`;
    router.push(searchUrl);
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
            <li>
              <Link href="/profile" className="text-brand-info hover:underline">
                Contul meu
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600" aria-current="page">
              Căutări Salvate
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/profile"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Înapoi la contul meu"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Bookmark className="h-8 w-8 text-brand-info" />
            <h1 className="text-3xl font-bold text-gray-900">
              Căutări Salvate
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Gestionează și refolosește căutările frecvente în știri
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-brand-info text-brand-info'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="h-4 w-4" />
              Toate căutările
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'favorites'
                  ? 'border-brand-info text-brand-info'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star className="h-4 w-4" />
              Favorite
            </button>
          </div>
        </div>

        {/* Content */}
        <SavedSearchesList
          onApplySearch={handleApplySearch}
          showFavoritesOnly={activeTab === 'favorites'}
          limit={50}
        />

        {/* Info pentru utilizatorii fără abonament */}
        {!hasPremiumAccess && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Bookmark className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Funcționalitate Premium
                </h3>
                <p className="text-blue-700 mb-4">
                  Căutările salvate sunt disponibile doar pentru utilizatorii cu abonament Pro sau Enterprise. 
                  Upgradează-ți abonamentul pentru a accesa această funcționalitate.
                </p>
                <Link
                  href="/preturi"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Vezi abonamentele
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
