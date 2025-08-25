'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import OverlayBackdrop from '@/components/ui/OverlayBackdrop';

type Alignment = 'left' | 'right';

export interface BusinessDayDatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  popoverAlign?: Alignment;
  min?: string; // YYYY-MM-DD
  disableWeekends?: boolean; // default: true
  disableFuture?: boolean; // default: true
  centered?: boolean; // default: true (render as centered modal)
  showBackdrop?: boolean; // default: true
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string): Date {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isFutureDate(date: Date): boolean {
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return date.getTime() > todayEnd.getTime();
}

function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function BusinessDayDatePicker(props: BusinessDayDatePickerProps) {
  const {
    value,
    onChange,
    placeholder = 'Selectează dată',
    disabled = false,
    className,
    buttonClassName,
    popoverAlign = 'left',
    min,
    disableWeekends = true,
    disableFuture = true,
    centered = true,
    showBackdrop = true
  } = props;

  const initialMonth = useMemo(() => {
    if (value) return parseLocalDate(value);
    return new Date();
  }, [value]);

  const [isOpen, setIsOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState<Date>(initialMonth);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (value) {
      setMonthCursor(parseLocalDate(value));
    }
  }, [value]);

  const currentDateString = value || '';

  function getDaysGrid(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Monday-first index (Mon=0 ... Sun=6)
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const cells: { date: Date; inCurrentMonth: boolean }[] = [];

    for (let i = startingDayOfWeek; i > 0; i--) {
      cells.push({ date: new Date(year, month, 1 - i), inCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ date: new Date(year, month, i), inCurrentMonth: true });
    }
    const remaining = 42 - cells.length; // 6 weeks * 7 days
    for (let i = 1; i <= remaining; i++) {
      cells.push({ date: new Date(year, month + 1, i), inCurrentMonth: false });
    }
    return cells;
  }

  const weekLabels = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];

  const handleSelect = (date: Date) => {
    if (disableWeekends && isWeekend(date)) return;
    if (disableFuture && isFutureDate(date)) return;
    if (min && parseLocalDate(min).getTime() > date.getTime()) return;
    const selected = toLocalDateString(date);
    if (selected === currentDateString) {
      setIsOpen(false);
      return;
    }
    onChange(selected);
    setIsOpen(false);
  };

  const goPrevMonth = () => {
    const d = new Date(monthCursor);
    d.setMonth(d.getMonth() - 1);
    setMonthCursor(d);
  };
  const goNextMonth = () => {
    const d = new Date(monthCursor);
    d.setMonth(d.getMonth() + 1);
    setMonthCursor(d);
  };

  const today = new Date();
  const todayDisabled = (disableWeekends && isWeekend(today)) || (disableFuture && isFutureDate(today)) || (min ? parseLocalDate(min).getTime() > today.getTime() : false);

  return (
    <div ref={containerRef} className={`relative inline-block ${className || ''}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-info ${buttonClassName || ''}`}
        title="Selectează o dată"
      >
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">
          {currentDateString
            ? new Date(parseLocalDate(currentDateString)).toLocaleDateString('ro-RO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            : placeholder}
        </span>
      </button>

      {isOpen && (
        <div
          className={
            centered
              ? 'fixed inset-0 z-[2000] flex items-center justify-center p-4'
              : `absolute z-50 mt-2 min-w-[320px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg ${
                  popoverAlign === 'right' ? 'right-0' : 'left-0'
                }`
          }
        >
          {centered && showBackdrop && (
            <OverlayBackdrop position="absolute" onClick={() => setIsOpen(false)} />
          )}
          <div className={`${centered ? 'relative z-10 w-[min(22rem,100%)] max-h-[calc(100vh-4rem)] overflow-auto rounded-lg border border-gray-200 bg-white p-4 shadow-2xl' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={goPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Luna anterioară">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-semibold text-gray-900">
              {`${capitalizeFirstLetter(monthCursor.toLocaleDateString('ro-RO', { month: 'long' }))} ${monthCursor.getFullYear()}`}
            </h3>
            <button onClick={goNextMonth} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Luna următoare">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekLabels.map((w) => (
              <div key={w} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysGrid(monthCursor).map((cell, idx) => {
              const dateStr = toLocalDateString(cell.date);
              const selected = currentDateString === dateStr;
              const weekend = disableWeekends && isWeekend(cell.date);
              const future = disableFuture && isFutureDate(cell.date);
              const belowMin = min ? parseLocalDate(min).getTime() > cell.date.getTime() : false;
              const disabled = weekend || future || belowMin;
              const isToday = toLocalDateString(today) === dateStr;
              const inMonth = cell.inCurrentMonth;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(cell.date)}
                  disabled={disabled || !inMonth}
                  className={
                    `w-8 h-8 rounded-lg text-sm font-medium transition-colors ` +
                    (inMonth
                      ? disabled
                        ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                        : 'text-gray-700 hover:bg-brand-info/10'
                      : 'text-gray-400 cursor-not-allowed') +
                    (selected ? ' bg-brand-info text-white hover:bg-brand-info' : '') +
                    (!selected && isToday ? ' bg-brand-info/20 text-brand-info' : '')
                  }
                  title={
                    weekend
                      ? 'Weekend - nu disponibil'
                      : cell.date.toLocaleDateString('ro-RO')
                  }
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={() => handleSelect(today)}
              disabled={todayDisabled}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                todayDisabled
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-brand-info bg-brand-info/10 hover:bg-brand-info/20'
              }`}
              title={todayDisabled ? 'Ziua curentă este indisponibilă' : undefined}
            >
              Ziua curentă
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Închide
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}


