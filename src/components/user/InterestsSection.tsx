'use client';

import { Settings } from 'lucide-react';

interface InterestsSectionProps {
  preferredCategories?: string[];
}

export function InterestsSection({ preferredCategories = [] }: InterestsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6 flex flex-col items-start gap-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Domeniile tale de interes
        </h3>

        <p className="text-gray-600 mb-0">
          Primești sinteze și alerte zilnice personalizate pe baza acestor subiecte.
        </p>

        <a
          href="/profile/preferences"
          className="w-full inline-flex items-center justify-center px-4 py-2 bg-brand-info text-white text-sm font-medium rounded-lg hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Modifică Preferințe
        </a>
      </div>
      
     
      {preferredCategories && preferredCategories.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {preferredCategories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white text-brand-info border-2 border-brand-info shadow-md hover:shadow-lg hover:bg-brand-info/5 transition-all duration-200"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <p className="text-gray-500 text-xl font-medium mb-2">Nu ai selectat încă preferințe</p>
          <p className="text-gray-400 text-base">Personalizează-ți experiența selectând categoriile de interes</p>
        </div>
      )}
    </div>
  );
}
