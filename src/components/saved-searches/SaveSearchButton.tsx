'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSaveSearch, useSavedSearches } from '@/features/saved-searches/hooks/useSavedSearches';
import { SearchParams } from '@/features/saved-searches/types';
import { Bookmark, BookmarkCheck, Loader2, Star, AlertCircle, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { OverlayBackdrop } from '@/components/ui/OverlayBackdrop';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { compareSearchParams, hasSearchContent, normalizeSearchParams } from '@/lib/utils/searchComparison';

interface SaveSearchButtonProps {
  searchParams: SearchParams;
  originalSearchParams?: SearchParams | null; // Allow null
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// O singură sursă de adevăr pentru starea butonului
type ButtonState = 'SAVABLE' | 'DUPLICATE' | 'NO_CHANGES' | 'EMPTY' | 'LOADING' | 'UNAUTHENTICATED';

export function SaveSearchButton({
  searchParams,
  originalSearchParams,
  className = '',
  variant = 'default',
  size = 'md',
  showLabel = true
}: SaveSearchButtonProps) {
  const { user, hasPremiumAccess } = useAuth();
  const { saveSearch, loading } = useSaveSearch();
  const { data: savedSearchesData } = useSavedSearches({ limit: 1000 });
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', isFavorite: false });
  const [buttonState, setButtonState] = useState<ButtonState>('EMPTY');

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  // Special handling for icon-only buttons to ensure consistent height
  const getButtonClasses = () => {
    // When showLabel is false, use minimal classes to avoid conflicts
    // Let the className prop control all styling including height and colors
    if (!showLabel) {
      return `inline-flex items-center justify-center gap-2 rounded-md transition-all duration-200`;
    }
    
    // For labeled buttons, use normal sizeClasses and stateClassName
    return `inline-flex items-center justify-center gap-2 rounded-md transition-all duration-200 ${sizeClasses[size]} ${stateClassName}`;
  };

  // useEffect refactorizat pentru a seta o singură stare, cu prioritate corectă
  useEffect(() => {
    if (!user || !hasPremiumAccess) {
      setButtonState('UNAUTHENTICATED');
      return;
    }
    
    if (!hasSearchContent(searchParams)) {
      setButtonState('EMPTY');
      return;
    }

    const normalizedCurrentParams = normalizeSearchParams(searchParams);

    const isDuplicate = savedSearchesData?.savedSearches.some(savedSearch => 
      compareSearchParams(normalizedCurrentParams, savedSearch.searchParams)
    ) ?? false;

    // Aici este cheia: `hasChanges` este false DOAR dacă `originalSearchParams` există
    // și este identic cu parametrii actuali. Pentru o căutare nouă, `originalSearchParams` va fi null.
    const hasChanges = !originalSearchParams || !compareSearchParams(normalizedCurrentParams, normalizeSearchParams(originalSearchParams));

    if (originalSearchParams && !hasChanges) {
      setButtonState('NO_CHANGES');
    } else if (isDuplicate && originalSearchParams?.query !== normalizedCurrentParams.query) { // Afișează duplicat doar dacă nu e aceeași căutare originală
      setButtonState('DUPLICATE');
    }
    else {
      setButtonState('SAVABLE');
    }
  }, [searchParams, originalSearchParams, savedSearchesData, user, hasPremiumAccess]);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
        toast.error('Numele căutării este obligatoriu.');
        return;
    }
    if (buttonState !== 'SAVABLE') {
        toast.error('Această căutare nu poate fi salvată.');
        return;
    }
    try {
        await saveSearch({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          searchParams,
          isFavorite: formData.isFavorite
        });
        toast.success('Căutarea a fost salvată cu succes!');
        setIsOpen(false);
        setFormData({ name: '', description: '', isFavorite: false });
    } catch (error) {
        console.error('Error saving search:', error);
        toast.error('A apărut o eroare la salvarea căutării.');
    }
  };
  
  const handleCancel = () => {
    setIsOpen(false);
    setFormData({ name: '', description: '', isFavorite: false });
  };
  
  const getButtonContent = () => {
      switch (buttonState) {
          case 'UNAUTHENTICATED':
          case 'EMPTY':
              return {
                  disabled: true,
                  icon: <Bookmark className="h-4 w-4" />,
                  label: 'Salvează căutarea',
                  tooltip: buttonState === 'EMPTY' ? 'Nu există parametri de căutare de salvat' : 'Funcționalitate pentru abonamentele Pro sau Enterprise',
                  tooltipClassName: 'bg-gray-600 text-white',
                  className: 'text-gray-400 cursor-not-allowed'
              };
          case 'DUPLICATE':
              return {
                  disabled: true,
                  icon: <AlertCircle className="h-4 w-4" />,
                  label: 'Căutare duplicată',
                  tooltip: 'Această combinație de filtre este deja salvată.',
                  tooltipClassName: 'bg-amber-600 text-white',
                  className: 'text-gray-400 cursor-not-allowed opacity-70'
              };
          case 'NO_CHANGES':
              return {
                  disabled: true,
                  icon: <Info className="h-4 w-4" />,
                  label: 'Căutare salvată',
                  tooltip: 'Modifică filtrele pentru a salva o nouă căutare.',
                  tooltipClassName: 'bg-brand-info text-white',
                  className: 'text-gray-400 cursor-not-allowed opacity-70'
              };
          case 'SAVABLE':
              const buttonVariantClasses = {
                  default: 'bg-brand-info text-white hover:bg-brand-highlight shadow-sm hover:shadow-md',
                  outline: 'border border-brand-info text-brand-info hover:bg-brand-info hover:text-white',
                  ghost: 'text-brand-info hover:bg-brand-info/10'
              };
              return {
                  disabled: loading,
                  icon: loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />,
                  label: 'Salvează căutarea',
                  tooltip: 'Poți salva această combinație de filtre.',
                  tooltipClassName: 'bg-brand-info text-white',
                  className: `${buttonVariantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95`
              };
          default:
              return {
                  disabled: true,
                  icon: <Bookmark className="h-4 w-4" />,
                  label: 'Salvează căutarea',
                  tooltip: '',
                  tooltipClassName: 'bg-gray-600 text-white',
                  className: 'text-gray-400 cursor-not-allowed'
              };
      }
  };

  const { disabled, icon, label, tooltip, tooltipClassName, className: stateClassName } = getButtonContent();

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
              <button
                onClick={() => !disabled && setIsOpen(true)}
                disabled={disabled}
                className={`${getButtonClasses()} ${className}`}
              >
                {icon}
                {showLabel && label}
              </button>
          </TooltipTrigger>
          <TooltipContent className={tooltipClassName}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isOpen && (
        <>
          <OverlayBackdrop onClick={handleCancel} zIndexClass="z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Salvează căutarea</h3>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                   <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label htmlFor="search-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Numele căutării *
                  </label>
                  <input
                    type="text"
                    id="search-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: Căutare Guvern 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="search-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere (opțional)
                  </label>
                  <textarea
                    id="search-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descriere scurtă a căutării..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is-favorite"
                    checked={formData.isFavorite}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                    className="h-4 w-4 text-brand-info focus:ring-brand border-gray-300 rounded"
                  />
                  <label htmlFor="is-favorite" className="ml-2 flex items-center gap-1 text-sm text-gray-700">
                    <Star className="h-4 w-4" />
                    Marchează ca favorit
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                    Anulează
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim()}
                    className="px-4 py-2 text-sm bg-brand-info text-white rounded-md hover:bg-brand-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkCheck className="h-4 w-4" />}
                    Salvează
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}

