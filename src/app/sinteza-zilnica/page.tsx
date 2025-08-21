'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getDailySynthesis } from '@/features/news/services/newsService';
import { DailySynthesis } from '@/features/news/types';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function SintezaZilnicaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State pentru sinteza și navigare
  const [synthesis, setSynthesis] = useState<DailySynthesis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');

  // Inițializare din URL params sau data curentă
  useEffect(() => {
    const urlDate = searchParams.get('date');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const initialDate = urlDate || today;
    setCurrentDate(initialDate);
  }, [searchParams]);

  // Funcția pentru încărcarea sintezei
  const loadSynthesis = useCallback(async (date: string) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getDailySynthesis({ date });
      setSynthesis(response.getDailySynthesis);
      
      // Actualizează URL-ul cu data curentă
      const params = new URLSearchParams();
      params.set('date', date);
      router.push(`/sinteza-zilnica?${params.toString()}`, { scroll: false });
    } catch (err) {
      console.error('Error loading synthesis:', err);
      setError('A apărut o eroare la încărcarea sintezei. Vă rugăm să încercați din nou.');
      setSynthesis(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Efect pentru încărcarea sintezei când se schimbă data
  useEffect(() => {
    if (currentDate) {
      loadSynthesis(currentDate);
    }
  }, [currentDate, loadSynthesis]);

  // Funcții pentru navigare
  const goToPreviousDay = () => {
    if (!currentDate) return;
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    const newDate = date.toISOString().split('T')[0];
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    if (!currentDate) return;
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    const newDate = date.toISOString().split('T')[0];
    setCurrentDate(newDate);
  };

  // Formatare dată pentru afișare
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Verificare dacă data este în viitor
  const isFutureDate = (dateString: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Sfârșitul zilei de azi
    const checkDate = new Date(dateString);
    return checkDate > today;
  };

  // Verificare dacă butonul "următoarea zi" ar trebui să fie dezactivat
  const isNextDayDisabled = isFutureDate(currentDate);

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
              Sinteza Zilnică
            </li>
          </ol>
        </nav>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header cu titlu și descriere */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Sinteza Zilnică
            </h1>
            <p className="text-lg text-gray-600">
              Rezumatul zilnic al activității legislative și administrative
            </p>
          </div>

          {/* Navigare cu săgeți și data */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Săgeată stânga */}
            <button
              onClick={goToPreviousDay}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Ziua anterioară"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Ziua anterioară</span>
            </button>

            {/* Data centrală */}
            <div className="flex items-center gap-2 text-center">
              <Calendar className="h-5 w-5 text-brand-info" />
              <time 
                dateTime={currentDate} 
                className="text-xl font-semibold text-gray-900"
              >
                {currentDate ? formatDisplayDate(currentDate) : '...'}
              </time>
            </div>

            {/* Săgeată dreapta */}
            <button
              onClick={goToNextDay}
              disabled={loading || isNextDayDisabled}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isNextDayDisabled ? "Nu există sinteze pentru zilele viitoare" : "Ziua următoare"}
            >
              <span className="hidden sm:inline">Ziua următoare</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Conținutul sintezei */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Loading state */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                <p className="text-gray-600">Se încarcă sinteza...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Eroare la încărcare</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => loadSynthesis(currentDate)}
                  className="px-4 py-2 bg-brand-info text-white rounded-md hover:bg-brand-highlight transition-colors"
                >
                  Încearcă din nou
                </button>
              </div>
            )}

            {/* Sinteza existentă */}
            {!loading && !error && synthesis && (
              <div className="space-y-6">
                {/* Titlu */}
                <header className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {synthesis.title}
                  </h2>
                  {synthesis.summary && (
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {synthesis.summary}
                    </p>
                  )}
                </header>

                {/* Conținut HTML */}
                <div className="prose prose-lg max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: synthesis.content }}
                    className="text-gray-700 leading-relaxed"
                  />
                </div>

                {/* Metadata */}
                {synthesis.metadata && (
                  <footer className="border-t border-gray-200 pt-4 mt-8">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {synthesis.metadata.character_count && (
                        <span>
                          {synthesis.metadata.character_count} caractere
                        </span>
                      )}
                      
                      {synthesis.metadata.hashtags && synthesis.metadata.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {synthesis.metadata.hashtags.map((hashtag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </footer>
                )}
              </div>
            )}

            {/* Mesaj când nu există sinteză */}
            {!loading && !error && !synthesis && (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nu există sinteză pentru data selectată
                </h3>
                <p className="text-gray-600 mb-4">
                  Pentru data {currentDate ? formatDisplayDate(currentDate) : ''} nu a fost găsită nicio sinteză.
                </p>
                <div className="text-gray-500 text-sm">
                  <p>Sugestii:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Încercați o altă dată</li>
                    <li>• Verificați dacă data este corectă</li>
                    <li>• Sintezele sunt disponibile doar pentru zilele trecute</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Informații suplimentare */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Despre Sinteza Zilnică
            </h3>
            <p className="text-sm text-blue-800">
              Sinteza zilnică oferă un rezumat comprehensiv al activității legislative și administrative din Monitorul Oficial. 
              Conținutul include hotărâri de guvern, ordonanțe, legi și alte acte normative publicate în ziua respectivă.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function SintezaZilnicaPage() {
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
      <SintezaZilnicaContent />
    </Suspense>
  );
}
