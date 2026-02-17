import React, { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { Loader2, Search } from 'lucide-react';

interface CompanySearchInputProps {
  onSelect: (company: any) => void;
  register: any; // passed from react-hook-form for the input
  setValue: any;
  error?: string;
  defaultValue?: string;
}

// Minimal debounce hook implementation if not exists
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function CompanySearchInput({ onSelect, register, setValue, error, defaultValue }: CompanySearchInputProps) {
  const [query, setQuery] = useState(defaultValue || '');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounceValue(query, 500);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function searchCompany() {
      if (!debouncedQuery || debouncedQuery.length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Send 'query' instead of 'cui' to match new backend
        const res = await fetch('/api/companies/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: debouncedQuery })
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data && !data.error) {
                // If backend returns single object, wrap in array
                const list = Array.isArray(data) ? data : [data];
                setResults(list);
                setIsOpen(true);
            } else {
                setResults([]);
            }
        } else {
            setResults([]);
        }
      } catch (e) {
        console.error(e);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    searchCompany();
  }, [debouncedQuery]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Caută Companie (CUI sau Nume)
      </label>
      <div className="relative">
        <input
            type="text"
            // Use 'cui' registration but handle as query input
            {...register('cui')}
            onChange={(e) => {
                register('cui').onChange(e);
                setQuery(e.target.value);
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-info focus:ring-brand-info sm:text-sm py-2 px-3 pl-10 border placeholder:text-gray-400"
            placeholder="Introduceți CUI sau Numele Companiei"
            autoComplete="off"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
                <Search className="h-4 w-4 text-gray-400" />
            )}
        </div>
      </div>
      
      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {results.map((company, idx) => (
                <li
                    key={idx}
                    className="cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-brand-info hover:text-white text-gray-900 relative border-b last:border-0 border-gray-100"
                    onClick={() => {
                        onSelect(company);
                        // Update input with CUI as that's the canonical ID usually, or Name?
                        // User likely wants the CUI in the field if it's the "cui" field.
                        // But label says "CUI sau Nume". 
                        // If we fill CUI, it's clear.
                        setQuery(company.cui);
                        setValue('cui', company.cui); // This updates the form value
                        setIsOpen(false);
                        setResults([]);
                    }}
                >
                    <span className="block truncate font-medium">{company.name}</span>
                    <div className="flex justify-between text-xs opacity-75 mt-1">
                        <span>CUI: {company.cui}</span>
                        <span>{company.city}, {company.county}</span>
                    </div>
                </li>
            ))}
        </ul>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
