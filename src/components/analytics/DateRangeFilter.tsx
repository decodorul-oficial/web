'use client';

import { useState } from 'react';
import BusinessDayDatePicker from '@/components/ui/BusinessDayDatePicker';

interface DateRangeFilterProps {
  dateRange: { startDate: Date; endDate: Date };
  onDateRangeChange: (dateRange: { startDate: Date; endDate: Date }) => void;
  onApplyFilter: () => void;
}

export function DateRangeFilter({ dateRange, onDateRangeChange, onApplyFilter }: DateRangeFilterProps) {
  const [localDateRange, setLocalDateRange] = useState(dateRange);



  const handleApplyFilter = () => {
    onDateRangeChange(localDateRange);
    onApplyFilter();
  };

  const handleQuickSelect = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const newDateRange = { startDate, endDate };
    setLocalDateRange(newDateRange);
    onDateRangeChange(newDateRange);
    onApplyFilter();
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Filtrare pe interval de date
          </h3>
          <p className="text-sm text-gray-600">
            Selectează perioada pentru care dorești să vizualizezi analiticele
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickSelect(7)}
            className="px-4 py-2 text-sm bg-brand-info/10 text-brand-info rounded-lg hover:bg-brand-info/20 transition-colors font-medium"
          >
            Ultimele 7 zile
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="px-4 py-2 text-sm bg-brand-info/10 text-brand-info rounded-lg hover:bg-brand-info/20 transition-colors font-medium"
          >
            Ultimele 30 zile
          </button>
          <button
            onClick={() => handleQuickSelect(90)}
            className="px-4 py-2 text-sm bg-brand-info/10 text-brand-info rounded-lg hover:bg-brand-info/20 transition-colors font-medium"
          >
            Ultimele 3 luni
          </button>
        </div>
      </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
              Data de început
            </label>
            <BusinessDayDatePicker
              value={formatDateForInput(localDateRange.startDate)}
              onChange={(dateString) => {
                const [year, month, day] = dateString.split('-').map(Number);
                const newDate = new Date(year, month - 1, day);
                setLocalDateRange(prev => ({ ...prev, startDate: newDate }));
              }}
              placeholder="Selectează data de început"
              className="w-full"
              buttonClassName="w-full"
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
              Data de sfârșit
            </label>
            <BusinessDayDatePicker
              value={formatDateForInput(localDateRange.endDate)}
              onChange={(dateString) => {
                const [year, month, day] = dateString.split('-').map(Number);
                const newDate = new Date(year, month - 1, day);
                setLocalDateRange(prev => ({ ...prev, endDate: newDate }));
              }}
              placeholder="Selectează data de sfârșit"
              className="w-full"
              buttonClassName="w-full"
            />
          </div>

        <div>
          <button
            onClick={handleApplyFilter}
            className="w-full bg-brand-info hover:bg-brand-info/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-info focus:ring-offset-2 shadow-sm"
          >
            Aplică Filtru
          </button>
        </div>
      </div>

      <div className="bg-brand-info/10 border border-brand-info/20 rounded-lg p-4">
        <p className="text-sm text-brand-info">
          <span className="font-semibold">Perioada selectată:</span>{' '}
          {localDateRange.startDate.toLocaleDateString('ro-RO')} - {localDateRange.endDate.toLocaleDateString('ro-RO')}
        </p>
      </div>
    </div>
  );
}
