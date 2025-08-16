'use client';

import { useState } from 'react';
import { NEWS_VIEW_PERIODS, type NewsViewPeriod } from '../config/periods';
import { trackPeriodSelection } from '../../../lib/analytics';

interface PeriodSelectorProps {
  currentPeriod: NewsViewPeriod;
  onPeriodChange: (period: NewsViewPeriod) => void;
}

export function PeriodSelector({ currentPeriod, onPeriodChange }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = NEWS_VIEW_PERIODS[currentPeriod];

  const handlePeriodChange = (period: NewsViewPeriod) => {
    onPeriodChange(period);
    setIsOpen(false);
    
    // Track period selection
    trackPeriodSelection(period);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      >
        <span>{currentConfig.labelRo}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 min-w-[200px] rounded border border-gray-200 bg-white shadow-lg">
          {Object.values(NEWS_VIEW_PERIODS).map((period) => (
            <button
              key={period.value}
              onClick={() => handlePeriodChange(period.value as NewsViewPeriod)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                currentPeriod === period.value
                  ? 'bg-brand-info/10 text-brand-info font-medium'
                  : 'text-gray-700'
              }`}
            >
              <div className="font-medium">{period.labelRo}</div>
              <div className="text-xs text-gray-500">{period.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
