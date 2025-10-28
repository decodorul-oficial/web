'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUserPreferences } from '@/features/user/hooks/useUserPreferences';
import { Category } from '@/features/user/types';
import { ArrowLeft, Save, Search, X, RotateCcw } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function PreferencesPage() {
  const { user, loading: userLoading } = useAuth();
  const { preferences, categories, loading: preferencesLoading, updatePreferences } = useUserPreferences();
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Unified toast messages
  const showToast = (type: 'success' | 'error', isAutoSave: boolean = false, isUnexpectedError: boolean = false) => {
    const messages = {
      success: isAutoSave ? 'Preferințele au fost salvate automat' : 'Preferințele au fost salvate cu succes!',
      error: isUnexpectedError 
        ? 'A apărut o eroare neașteptată.'
        : isAutoSave 
          ? 'Eroare la salvarea automată a preferințelor.' 
          : 'A apărut o eroare la salvarea preferințelor.'
    };

    const toastOptions = {
      duration: isAutoSave ? 2000 : 4000,
      position: 'top-right' as const,
      ...(isAutoSave && {
        style: {
          fontSize: '14px',
          padding: '8px 12px',
        },
      }),
    };

    if (type === 'success') {
      toast.success(messages.success, toastOptions);
    } else {
      toast.error(messages.error, toastOptions);
    }
  };

  // Fuzzy search function
  const fuzzySearch = (query: string, text: string): boolean => {
    if (!query) return true;
    
    const queryLower = query.toLowerCase().trim();
    const textLower = text.toLowerCase();
    
    // Exact match gets highest priority
    if (textLower.includes(queryLower)) return true;
    
    // Check if all characters in query appear in order in text
    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++;
      }
    }
    
    return queryIndex === queryLower.length;
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    return categories.filter(category => 
      fuzzySearch(searchQuery, category.name)
    );
  }, [categories, searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Auto-save function with debounce
  const autoSave = async (newCategories: string[]) => {
    // Prevent multiple simultaneous saves
    if (autoSaving) return;
    
    // Debounce: only save if it's been at least 500ms since last save
    const now = Date.now();
    if (now - lastSaveTime < 500) {
      return;
    }
    
    setLastSaveTime(now);
    setAutoSaving(true);
    
    try {
      const success = await updatePreferences(newCategories);
      if (success) {
        showToast('success', true);
      } else {
        showToast('error', true);
      }
    } catch (error) {
      showToast('error', true, true);
    } finally {
      setAutoSaving(false);
    }
  };

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!preferencesLoading) {
      setSelectedCategories(preferences);
    }
  }, [preferences, preferencesLoading]);

  const toggleCategory = async (slug: string) => {
    const newCategories = selectedCategories.includes(slug) 
      ? selectedCategories.filter(c => c !== slug)
      : [...selectedCategories, slug];
    
    // Update local state immediately for responsive UI
    setSelectedCategories(newCategories);
    
    // Auto-save the changes
    await autoSave(newCategories);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Scroll to top immediately when save button is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      const success = await updatePreferences(selectedCategories);
      
      if (success) {
        showToast('success', false);
      } else {
        showToast('error', false);
      }
    } catch (error) {
      showToast('error', false, true);
    } finally {
      setSaving(false);
    }
  };

  const handleResetCategories = async () => {
    setShowResetDialog(false);
    
    // Update local state immediately for responsive UI
    setSelectedCategories([]);
    
    // Auto-save the changes
    await autoSave([]);
    
    // Show success message
    showToast('success', true);
  };

  if (userLoading || preferencesLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-info mx-auto mb-4"></div>
            <p className="text-gray-600">Se încarcă preferințele...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-responsive flex-1 py-8">
        <div className="max-w-8xl mx-auto">
          <div className="mb-6">
            <nav className="text-sm text-gray-500" aria-label="breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <a href="/" className="hover:underline">Acasă</a>
                </li>
                <li>/</li>
                <li>
                  <a href="/profile" className="hover:underline">Profil</a>
                </li>
                <li>/</li>
                <li className="text-gray-700">Preferințe</li>
              </ol>
            </nav>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Preferințele mele</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Categorii de interes
              </h2>
              <p className="text-gray-600">
                Selectează categoriile care te interesează pentru a primi știri relevante pentru domeniul tău de activitate.
              </p>
            </div>


            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-900">
                  Selectează categoriile
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    {selectedCategories.length} categorii selectate
                    {autoSaving && (
                      <div className="flex items-center gap-1 text-brand-info">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-brand-info"></div>
                        <span className="text-xs">Se salvează...</span>
                      </div>
                    )}
                  </span>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => setShowResetDialog(true)}
                      disabled={autoSaving}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title="Resetează toate categoriile selectate"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Resetează
                    </button>
                  )}
                </div>
              </div>

              {/* Search Input */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Caută categorii... (ex: financiar, sănătate, educație)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-info focus:border-brand-info sm:text-sm"
                  />
                  {searchQuery && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        onClick={clearSearch}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {searchQuery && (
                  <p className="mt-2 text-sm text-gray-600">
                    {filteredCategories.length} categorii găsite pentru "{searchQuery}"
                  </p>
                )}
              </div>

              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => toggleCategory(category.slug)}
                      disabled={autoSaving}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedCategories.includes(category.slug)
                          ? 'border-brand-info/50 bg-brand-info/20 text-gray-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      } ${autoSaving ? 'opacity-75 cursor-wait' : 'cursor-pointer'}`}
                    >
                      <div className="text-center">
                        <div className="font-medium text-sm mb-1">
                          {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {category.count} articole
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  </div>
                  <p className="text-gray-600 mb-2">Nu s-au găsit categorii pentru "{searchQuery}"</p>
                  <p className="text-sm text-gray-500">
                    Încearcă să cauți cu termeni mai generali sau verifică ortografia
                  </p>
                  <button
                    onClick={clearSearch}
                    className="mt-4 text-brand-info hover:text-brand-highlight text-sm font-medium"
                  >
                    Șterge căutarea
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <a
                href="/profile"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la profil
              </a>
              
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || autoSaving}
                  className={`inline-flex items-center px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                    saving || autoSaving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                  }`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Se salvează...' : 'Salvare manuală'}
                </button>
                <span className="text-xs text-gray-500">
                  Preferințele se salvează automat
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Reset Categories Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleResetCategories}
        title="Resetează categoriile de interes"
        message={`Ești sigur că vrei să resetezi toate categoriile selectate? Această acțiune va șterge toate cele ${selectedCategories.length} categorii selectate și nu poate fi anulată.`}
        confirmText="Resetează toate"
        cancelText="Anulează"
        variant="warning"
        loading={autoSaving}
      />
    </div>
  );
}
