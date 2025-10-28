'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useUserPreferences } from '@/features/user/hooks/useUserPreferences';
import { Category } from '@/features/user/types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const { categories, loading, updatePreferences } = useUserPreferences();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) 
        ? prev.filter(c => c !== slug)
        : [...prev, slug]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await updatePreferences(selectedCategories);
    setSaving(false);
    
    if (success) {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Personalizează-ți feed-ul! 🎯
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Selectează categoriile care te interesează pentru a primi știri relevante pentru domeniul tău de activitate.
          </p>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Se încarcă categoriile...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Categorii de interes
                  </h3>
                  <span className="text-sm text-gray-500">
                    {selectedCategories.length} selectate
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => toggleCategory(category.slug)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedCategories.includes(category.slug)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
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
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Treci peste
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                    saving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {saving ? 'Se salvează...' : 'Salvează preferințele'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
