'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { createNewsSlug } from '@/lib/utils/slugify';
import Link from 'next/link';
import { BookmarkCheck, BookmarkX, Calendar, Eye, Trash2, Lock, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useAuth } from '@/components/auth/AuthProvider';
import { useConsent } from '@/components/cookies/ConsentProvider';
import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { isAuthenticated, hasPremiumAccess, loading: authLoading } = useAuth();
  const { consent, isLoaded: consentLoaded } = useConsent();
  const { favorites, loading, error, clearAllFavorites, toggleFavorite, canUseFavorites } = useFavorites();
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);


  useEffect(() => {
    // Redirect if not authenticated or no premium access
    if (!authLoading && consentLoaded) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (!hasPremiumAccess) {
        router.push('/preturi');
        return;
      }
      if (!consent) {
        router.push('/cookies');
        return;
      }
    }
  }, [isAuthenticated, hasPremiumAccess, authLoading, consent, consentLoaded, router]);

  const handleClearAllFavorites = async () => {
    if (!canUseFavorites) return;
    
    if (confirm('Ești sigur că vrei să ștergi toate știrile din favorite?')) {
      try {
        await clearAllFavorites();
      } catch (err) {
        console.error('Error clearing all favorites:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ro });
    } catch {
      return dateString;
    }
  };


  // Show loading while checking authentication and consent
  if (authLoading || !consentLoaded || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show access denied for non-authenticated, non-premium users, or no cookie consent
  if (!isAuthenticated || !hasPremiumAccess || !consent) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="mb-6">
                {!isAuthenticated ? (
                  <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                ) : (
                  <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {!isAuthenticated ? 'Acces Restricționat' : !hasPremiumAccess ? 'Abonament Premium Necesar' : 'Consimțământ Cookie Necesar'}
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {!isAuthenticated 
                  ? 'Trebuie să te conectezi pentru a accesa știrile tale favorite.'
                  : !hasPremiumAccess 
                    ? 'Funcționalitatea de favorite este disponibilă doar pentru utilizatorii cu abonament premium.'
                    : 'Trebuie să accepți cookie-urile pentru a salva și accesa știrile tale favorite.'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-accent transition-colors"
                    >
                      Conectează-te
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-brand text-brand rounded-lg hover:bg-brand hover:text-white transition-colors"
                    >
                      Creează cont
                    </Link>
                  </>
                ) : !hasPremiumAccess ? (
                  <Link
                    href="/preturi"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-accent transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    Vezi abonamente
                  </Link>
                ) : (
                  <Link
                    href="/cookies"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-accent transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Acceptă cookie-urile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="container-responsive flex-1 py-8">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookmarkCheck className="w-8 h-8 text-brand-info" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Știri Favorite
                </h1>
              </div>
              
              {favorites.length > 0 && (
                <button
                  onClick={handleClearAllFavorites}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Șterge toate
                </button>
              )}
            </div>
            
            <p className="text-gray-600">
              {favorites.length === 0 
                ? 'Nu ai salvat încă nicio știre la favorite.'
                : `Ai salvat ${favorites.length} ${favorites.length === 1 ? 'știre' : 'știri'} la favorite.`
              }
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {favorites.length === 0 && !error && (
            <div className="text-center py-12">
              <BookmarkCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nu ai favorite încă
              </h3>
              <p className="text-gray-600 mb-6">
                Când îți place o știre, apasă pe butonul de bookmark pentru a o salva aici.
              </p>
              <Link
                href="/stiri"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-accent transition-colors"
              >
                Vezi toate știrile
              </Link>
            </div>
          )}

          {/* Favorites list */}
          {favorites.length > 0 && (
            <div className="space-y-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link
                          href={`/stiri/${createNewsSlug(favorite.title, favorite.newsId)}`}
                          className="hover:text-brand-info transition-colors"
                        >
                          {favorite.title}
                        </Link>
                      </h2>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(favorite.publicationDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{favorite.viewCount ?? 0} vizualizări</span>
                        </div>
                      </div>
                      
                      {favorite.summary && (
                        <p className="text-gray-600 line-clamp-2">
                          {favorite.summary}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="relative">
                        <button
                          onClick={async () => {
                            try {
                              await toggleFavorite(favorite.newsId);
                            } catch (err) {
                              console.error('Error removing favorite:', err);
                            }
                          }}
                          onMouseEnter={() => setShowTooltip(favorite.newsId)}
                          onMouseLeave={() => setShowTooltip(null)}
                          className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-all duration-200 border border-gray-200 bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] text-gray-600 hover:text-brand-info"
                          title="Șterge de la favorite"
                        >
                          <BookmarkX className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        </button>

                        {/* Tooltip */}
                        {showTooltip === favorite.newsId && (
                          <div className="absolute z-50 -top-10 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                              Șterge de la favorite
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
