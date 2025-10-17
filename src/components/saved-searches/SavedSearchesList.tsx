'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSavedSearches, useDeleteSavedSearch, useToggleFavoriteSearch, useToggleEmailNotifications, useEmailNotificationInfo, useUpdateSavedSearch } from '@/features/saved-searches/hooks/useSavedSearches';
import { SearchParams } from '@/features/saved-searches/types';
import { 
  Bookmark, 
  Star, 
  StarOff, 
  Trash2, 
  Search, 
  Calendar, 
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreVertical,
  Edit3,
  Bell,
  BellOff
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { NotificationCounter } from './NotificationCounter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface SavedSearchesListProps {
  onApplySearch?: (searchParams: SearchParams) => void;
  className?: string;
  showFavoritesOnly?: boolean;
  limit?: number;
  showHeader?: boolean;
}

export function SavedSearchesList({ 
  onApplySearch, 
  className = '',
  showFavoritesOnly = false,
  limit = 10,
  showHeader = true
}: SavedSearchesListProps) {
  const { user, hasPremiumAccess } = useAuth();
  const { data, loading, error, refetch, hasAccess } = useSavedSearches({
    limit,
    favoritesOnly: showFavoritesOnly,
    orderBy: 'updatedAt',
    orderDirection: 'desc'
  });
  const { deleteSavedSearch, loading: deleteLoading } = useDeleteSavedSearch();
  const { toggleFavoriteSearch, loading: toggleLoading } = useToggleFavoriteSearch();
  const { toggleEmailNotifications, loading: notificationLoading } = useToggleEmailNotifications();
  const { data: notificationInfo } = useEmailNotificationInfo();
  const { updateSavedSearch, loading: updateLoading } = useUpdateSavedSearch();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [editingNames, setEditingNames] = useState<Set<string>>(new Set());
  const [editNameValues, setEditNameValues] = useState<Record<string, string>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside any dropdown
      const isOutsideDropdown = Object.values(dropdownRefs.current).every(ref => 
        ref && !ref.contains(target)
      );
      
      if (isOutsideDropdown) {
        setOpenDropdowns(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Ești sigur că vrei să ștergi căutarea "${name}"?`)) {
      return;
    }

    try {
      const success = await deleteSavedSearch(id);
      if (success) {
        toast.success('Căutarea a fost ștearsă cu succes!');
        refetch();
      }
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavoriteSearch(id);
      refetch();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleNotification = async (id: string, currentState: boolean) => {
    if (!user || !hasPremiumAccess) {
      toast.error('Funcționalitate disponibilă pentru abonamentele PRO și Enterprise.');
      return;
    }

    if (!notificationInfo?.canEnableMore && !currentState) {
      toast.error(`Ați atins limita de ${notificationInfo?.limit} notificări active.`);
      return;
    }

    try {
      await toggleEmailNotifications(id, !currentState);
      toast.success(`Notificările au fost ${!currentState ? 'activate' : 'dezactivate'}.`);
      refetch();
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('A apărut o eroare. Vă rugăm să încercați din nou.');
    }
  };

  const handleApplySearch = (searchParams: SearchParams) => {
    if (onApplySearch) {
      onApplySearch(searchParams);
    }
  };

  const handleSearchClick = (searchParams: SearchParams) => {
    handleApplySearch(searchParams);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startEditingName = (id: string, currentName: string) => {
    setEditingNames(prev => new Set(prev).add(id));
    setEditNameValues(prev => ({ ...prev, [id]: currentName }));
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const cancelEditingName = (id: string) => {
    setEditingNames(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setEditNameValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  const saveEditedName = async (id: string) => {
    const newName = editNameValues[id]?.trim();
    if (!newName) {
      toast.error('Numele nu poate fi gol');
      return;
    }

    try {
      const result = await updateSavedSearch(id, { name: newName });
      if (result) {
        toast.success('Numele a fost actualizat cu succes!');
        cancelEditingName(id);
        refetch();
      } else {
        toast.error('Eroare la actualizarea numelui');
      }
    } catch (error) {
      console.error('Error renaming search:', error);
      toast.error('Eroare la actualizarea numelui');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const buildSearchUrl = (searchParams: SearchParams) => {
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

    return `/stiri?${params.toString()}`;
  };

  // Dacă utilizatorul nu are acces
  if (!user || !hasAccess) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Căutări Salvate
        </h3>
        <p className="text-gray-600 mb-4">
          Funcționalitatea este disponibilă doar pentru utilizatorii cu abonament Pro sau Enterprise.
        </p>
        <Link
          href="/preturi"
          className="inline-flex items-center px-4 py-2 bg-brand-info text-white rounded-md hover:bg-brand-highlight transition-colors"
        >
          Vezi abonamentele
        </Link>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-info" />
          <span className="ml-2 text-gray-600">Se încarcă căutările salvate...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Eroare la încărcarea căutărilor
          </h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.savedSearches.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {showFavoritesOnly ? 'Nu ai căutări favorite' : 'Nu ai căutări salvate'}
        </h3>
        <p className="text-gray-600">
          {showFavoritesOnly 
            ? 'Marchează căutările ca favorite pentru a le vedea aici.'
            : 'Salvează căutările frecvente pentru a le refolosi rapid.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showHeader && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              {showFavoritesOnly ? 'Căutări Favorite' : 'Căutări Salvate'}
              {data.pagination.totalCount > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({data.pagination.totalCount})
                </span>
              )}
            </h3>
            <NotificationCounter />
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {data.savedSearches.map((search) => {
          const isExpanded = expandedItems.has(search.id);

          return (
            <div key={search.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {editingNames.has(search.id) ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editNameValues[search.id] || ''}
                          onChange={(e) => setEditNameValues(prev => ({ ...prev, [search.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEditedName(search.id);
                            } else if (e.key === 'Escape') {
                              cancelEditingName(search.id);
                            }
                          }}
                          onBlur={() => saveEditedName(search.id)}
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-info focus:border-transparent"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditedName(search.id)}
                          disabled={updateLoading}
                          className="p-1 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                          title="Salvează"
                        >
                          {updateLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => cancelEditingName(search.id)}
                          disabled={updateLoading}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                          title="Anulează"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 
                          className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-brand-info transition-colors"
                          onClick={() => handleSearchClick(search.searchParams)}
                          title="Click pentru a aplica căutarea"
                        >
                          {search.name}
                        </h4>
                        {search.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </div>

                  {search.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {search.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(search.updatedAt)}
                    </span>
                    <span>Actualizat</span>
                  </div>

                  {/* Preview parametri de căutare */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {search.searchParams.query && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        <Search className="h-3 w-3" />
                        {search.searchParams.query}
                      </span>
                    )}
                    {search.searchParams.keywords && search.searchParams.keywords.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <Filter className="h-3 w-3" />
                        {search.searchParams.keywords.length} keywords
                      </span>
                    )}
                    {(search.searchParams.publicationDateFrom || search.searchParams.publicationDateTo) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        <Calendar className="h-3 w-3" />
                        Perioadă
                      </span>
                    )}
                  </div>

                  {/* Detalii extinse */}
                  {isExpanded && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Parametrii de căutare:</h5>
                      <div className="text-xs text-gray-600 space-y-1">
                        {search.searchParams.query && (
                          <div><span className="font-medium">Text:</span> {search.searchParams.query}</div>
                        )}
                        {search.searchParams.keywords && search.searchParams.keywords.length > 0 && (
                          <div><span className="font-medium">Keywords:</span> {search.searchParams.keywords.join(', ')}</div>
                        )}
                        {search.searchParams.publicationDateFrom && (
                          <div><span className="font-medium">De la:</span> {search.searchParams.publicationDateFrom}</div>
                        )}
                        {search.searchParams.publicationDateTo && (
                          <div><span className="font-medium">Până la:</span> {search.searchParams.publicationDateTo}</div>
                        )}
                        {search.searchParams.orderBy && (
                          <div><span className="font-medium">Sortare:</span> {search.searchParams.orderBy} ({search.searchParams.orderDirection || 'desc'})</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Secondary Action Buttons with Text */}
                  {/* Notification Button */}
                  <button
                    onClick={() => handleToggleNotification(search.id, search.emailNotificationsEnabled || false)}
                    disabled={notificationLoading || (!user || !hasPremiumAccess) || (!notificationInfo?.canEnableMore && !search.emailNotificationsEnabled)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-brand-info transition-colors border border-gray-300 rounded-md hover:border-brand-info disabled:opacity-50 disabled:cursor-not-allowed"
                    title={search.emailNotificationsEnabled ? 'Dezactivează notificările' : 'Activează notificările'}
                  >
                    {notificationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : search.emailNotificationsEnabled ? (
                      <Bell className="h-4 w-4 text-brand-info" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                    <span className="text-xs">
                      {search.emailNotificationsEnabled ? 'Notificări ON' : 'Notificări OFF'}
                    </span>
                  </button>

                  {/* Favorite Button */}
                  <button
                    onClick={() => handleToggleFavorite(search.id)}
                    disabled={toggleLoading}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-yellow-500 transition-colors border border-gray-300 rounded-md hover:border-yellow-500 disabled:opacity-50"
                    title={search.isFavorite ? 'Elimină din favorite' : 'Adaugă la favorite'}
                  >
                    {search.isFavorite ? (
                      <Star className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                    <span className="text-xs">
                      {search.isFavorite ? 'Șterge din favorite' : 'Adaugă la favorite'}
                    </span>
                  </button>

                  {/* Primary Action Button */}
                  <button
                    onClick={() => handleSearchClick(search.searchParams)}
                    className="px-4 py-2 bg-brand-info text-white text-sm font-medium rounded-md hover:bg-brand-highlight transition-colors focus:outline-none focus:ring-2 focus:ring-brand-info focus:ring-offset-2"
                  >
                    Vezi rezultate
                  </button>

                  {/* More Options Dropdown */}
                  <div 
                    className="relative"
                    ref={(el) => {
                      dropdownRefs.current[search.id] = el;
                    }}
                  >
                    <button
                      onClick={() => toggleDropdown(search.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Mai multe opțiuni"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {openDropdowns.has(search.id) && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[140px]">
                        <button
                          onClick={() => startEditingName(search.id, search.name)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Redenumește</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(search.id, search.name);
                            setOpenDropdowns(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(search.id);
                              return newSet;
                            });
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Șterge</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginare dacă este necesară */}
      {data.pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Afișând {data.savedSearches.length} din {data.pagination.totalCount} căutări
          </p>
        </div>
      )}
    </div>
  );
}
