'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getDailySynthesis } from '@/features/news/services/newsService';
import { DailySynthesis } from '@/features/news/types';
import { ChevronLeft, ChevronRight, AlertCircle, Info } from 'lucide-react';
import OverlayBackdrop from '@/components/ui/OverlayBackdrop';
import Link from 'next/link';
import BusinessDayDatePicker from '@/components/ui/BusinessDayDatePicker';
import { ShareButtons } from '@/components/ui/ShareButtons';

// Funcții utilitare pentru gestionarea datelor
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Duminică, 6 = Sâmbătă
};

// Helpers pentru a lucra cu date locale (fără conversii UTC)
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString: string): Date => {
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  return new Date(year, month - 1, day);
};

const getNextBusinessDay = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Sărim weekendurile
  while (isWeekend(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

const getPreviousBusinessDay = (date: Date): Date => {
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  
  // Sărim weekendurile
  while (isWeekend(prevDay)) {
    prevDay.setDate(prevDay.getDate() - 1);
  }
  
  return prevDay;
};

const getCurrentValidDate = (): Date => {
  const today = new Date();
  
  // Dacă azi este weekend, sărim la ultima zi lucrătoare
  if (isWeekend(today)) {
    return getPreviousBusinessDay(today);
  }
  
  return today;
};

const formatDisplayDate = (dateString: string): string => {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatWeekday = (dateString: string): string => {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('ro-RO', { weekday: 'long' });
};

const isFutureDate = (dateString: string): boolean => {
  const now = new Date();
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
  const checkDate = parseLocalDate(dateString);
  return checkDate.getTime() > todayEnd.getTime();
};

const isWeekendDate = (dateString: string): boolean => {
  const date = parseLocalDate(dateString);
  return isWeekend(date);
};

function SintezaZilnicaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State pentru sinteza și navigare
  const [synthesis, setSynthesis] = useState<DailySynthesis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [weekendInfo, setWeekendInfo] = useState<{ message: string; visible: boolean } | null>(null);
  // Replaced custom datepicker with BusinessDayDatePicker
  const [showInfoToast, setShowInfoToast] = useState(false);

  // Inițializare din URL params sau data curentă
  useEffect(() => {
    const urlDate = searchParams.get('date');
    const today = getCurrentValidDate();
    
    let finalDate = toLocalDateString(today);
    
    // Dacă există o dată în URL, verifică dacă este validă
    if (urlDate) {
      if (isWeekendDate(urlDate)) {
        // Dacă data din URL este weekend, afișează un mesaj și folosește data curentă validă
        setError('Data selectată este weekend. Sintezele sunt disponibile doar pentru zilele lucrătoare. Se afișează sinteza pentru ultima zi lucrătoare.');
        finalDate = toLocalDateString(today);
      } else if (isFutureDate(urlDate)) {
        // Dacă data din URL este în viitor, afișează un mesaj și folosește data curentă validă
        setError('Data selectată este în viitor. Sintezele sunt disponibile doar pentru zilele trecute. Se afișează sinteza pentru ultima zi lucrătoare.');
        finalDate = toLocalDateString(today);
      } else {
        // Data din URL este validă
        finalDate = urlDate;
      }
    }
    
    setCurrentDate(finalDate);
  }, [searchParams]);

  // Funcția pentru încărcarea sintezei
  const loadSynthesis = useCallback(async (date: string) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getDailySynthesis({ date });
      setSynthesis(response.getDailySynthesis);
      
      // Actualizează URL-ul cu data curentă fără a declanșa o navigare Next.js
      // pentru a evita loader-ul global. Folosim History API (pushState).
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams();
        params.set('date', date);
        const newUrl = `/sinteza-zilnica?${params.toString()}`;
        window.history.pushState(null, '', newUrl);
      }
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
      // Verifică dacă data selectată este weekend
      if (isWeekendDate(currentDate)) {
        setError('Sintezele nu sunt disponibile pentru weekenduri. Vă rugăm să selectați o zi lucrătoare.');
        setSynthesis(null);
        return;
      }
      
      loadSynthesis(currentDate);
    }
  }, [currentDate, loadSynthesis]);

  // Efect pentru închiderea automată a modalului de informare weekend
  useEffect(() => {
    if (weekendInfo?.visible) {
      const timer = setTimeout(() => {
        setWeekendInfo(prev => prev ? { ...prev, visible: false } : null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [weekendInfo?.visible]);

  // (Click outside & close logic handled by BusinessDayDatePicker)

  // Funcții pentru navigare (sărim weekendurile)
  const goToPreviousDay = () => {
    if (!currentDate) return;
    const date = parseLocalDate(currentDate);
    const newDate = getPreviousBusinessDay(date);
    const newDateString = toLocalDateString(newDate);
    
    // Calculează câte zile au fost sărite
    const daysSkipped = Math.floor((date.getTime() - newDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSkipped > 1) {
      setWeekendInfo({
        message: `S-au sărit ${daysSkipped - 1} zile de weekend pentru a ajunge la ultima zi lucrătoare.`,
        visible: true
      });
    }
    
    setCurrentDate(newDateString);
  };

  const goToNextDay = () => {
    if (!currentDate) return;
    const date = parseLocalDate(currentDate);
    const newDate = getNextBusinessDay(date);
    const newDateString = toLocalDateString(newDate);
    
    // Calculează câte zile au fost sărite
    const daysSkipped = Math.floor((newDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSkipped > 1) {
      setWeekendInfo({
        message: `S-au sărit ${daysSkipped - 1} zile de weekend pentru a ajunge la următoarea zi lucrătoare.`,
        visible: true
      });
    }
    
    setCurrentDate(newDateString);
  };

  // Verificări pentru butoane
  const isNextDayDisabled = (() => {
    if (!currentDate) return true;
    
    // Verifică dacă următoarea zi lucrătoare este în viitor
    const nextBusinessDay = getNextBusinessDay(parseLocalDate(currentDate));
    return isFutureDate(toLocalDateString(nextBusinessDay));
  })();
  
  const isPreviousDayDisabled = false; // Întotdeauna activ pentru zilele trecute

  // (Datepicker logic replaced by BusinessDayDatePicker)

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
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Sinteza Zilnică
              </h1>
              <button
                onClick={() => setShowInfoToast(true)}
                aria-label="Informații despre pagină"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-brand-info hover:bg-brand-info hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-info focus:ring-offset-2"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            <p className="hidden sm:block text-lg text-gray-600">
              Rezumatul zilnic al activității legislative și administrative
            </p>
          </div>

          {/* Navigare cu săgeți și data */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Săgeată stânga */}
            <button
              onClick={goToPreviousDay}
              disabled={loading || isPreviousDayDisabled}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Ziua anterioară (săptămâna lucrătoare)"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Ziua anterioară</span>
            </button>

            {/* Data centrală cu ziua săptămânii */}
            <div className="flex flex-col items-center gap-1 text-center relative">
              <BusinessDayDatePicker
                value={currentDate}
                onChange={(d) => setCurrentDate(d)}
                disableWeekends={true}
                disableFuture={true}
                centered={true}
                showBackdrop={true}
                buttonClassName="text-xl font-semibold text-gray-900 hover:text-brand-info transition-colors cursor-pointer"
              />
              {currentDate && (
                <span className="text-sm font-medium text-brand-info capitalize">
                  {formatWeekday(currentDate)}
                </span>
              )}
            </div>

            {/* Săgeată dreapta */}
            <button
              onClick={goToNextDay}
              disabled={loading || isNextDayDisabled}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isNextDayDisabled ? "Nu există sinteze pentru zilele viitoare" : "Ziua următoare (săptămâna lucrătoare)"}
            >
              <span className="hidden sm:inline">Ziua următoare</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Info toast (înlocuiește panourile albastre) */}
          {showInfoToast && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
              {/* background overlay similar cu loader-ul global */}
              <OverlayBackdrop position="absolute" onClick={() => setShowInfoToast(false)} />
              <div className="w-[min(40rem,100%)] rounded-lg border border-blue-200 bg-white/90 backdrop-blur-md shadow-2xl">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-blue-50 p-2 text-blue-600">
                      <Info className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Navigare între zile</h4>
                      <p className="text-sm text-gray-700">
                        Sintezele sunt disponibile doar pentru zilele lucrătoare (Luni–Vineri). Weekendurile sunt sărite automat în navigare. Click pe data pentru a selecta o zi specifică din trecut.
                      </p>
                      <h4 className="text-sm font-semibold text-gray-900 mt-3 mb-1">Despre Sinteza Zilnică</h4>
                      <p className="text-sm text-gray-700">
                        Sinteza zilnică oferă un rezumat comprehensiv al activității legislative și administrative din Monitorul Oficial. Conținutul include hotărâri de guvern, ordonanțe, legi și alte acte normative publicate în ziua respectivă.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowInfoToast(false)}
                      className="ml-2 rounded-md p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      aria-label="Închide"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => setShowInfoToast(false)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-brand-info hover:bg-brand-highlight rounded-md"
                    >
                      Am înțeles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conținutul sintezei */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
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

                {/* Share buttons */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Distribuie această sinteză
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Ajută-i pe colegii tăi să rămână la curent cu legislația!
                  </p>
                  <ShareButtons
                    url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro'}/sinteza-zilnica?date=${currentDate}`}
                    title={`Sinteza zilnică - ${currentDate ? formatDisplayDate(currentDate) : ''}`}
                    description={synthesis.summary || synthesis.title}
                    variant="horizontal"
                    showLabels={true}
                    className="justify-start"
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

          {/* Panoul informativ albastru este mutat în toast la cerere */}
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
