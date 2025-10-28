'use client';

import { useState } from 'react';
import { SavedSearchesList } from './SavedSearchesList';
import { SearchParams } from '@/features/saved-searches/types';
import { Bookmark, Star, Search, X } from 'lucide-react';
import { OverlayBackdrop } from '@/components/ui/OverlayBackdrop';

interface SavedSearchesManagerProps {
  onApplySearch?: (searchParams: SearchParams) => void;
  className?: string;
}

export function SavedSearchesManager({ onApplySearch, className = '' }: SavedSearchesManagerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [isOpen, setIsOpen] = useState(false);

  const handleApplySearch = (searchParams: SearchParams) => {
    if (onApplySearch) {
      onApplySearch(searchParams);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Buton pentru deschiderea managerului */}
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-brand-info text-white rounded-b-md hover:bg-brand-highlight transition-colors ${className}`}
      >
        <Bookmark className="h-4 w-4" />
        Căutări Salvate
      </button>

      {/* Modal pentru managerul de căutări salvate */}
      {isOpen && (
        <>
          <OverlayBackdrop 
            onClick={() => setIsOpen(false)}
            zIndexClass="z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Căutări Salvate
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tabs */}
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <SavedSearchesList
                  onApplySearch={handleApplySearch}
                  showFavoritesOnly={activeTab === 'favorites'}
                  limit={20}
                  className="bg-white rounded-lg border border-gray-200"
                  showHeader={false}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}