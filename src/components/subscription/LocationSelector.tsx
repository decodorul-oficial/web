import React, { useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Control, Controller, UseFormSetValue, UseFormWatch } from 'react-hook-form';

interface LocationSelectorProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  errors: any;
  watch: UseFormWatch<any>;
}

interface GeoItem {
  nume: string;
  // listă de opțiuni pentru combobox-ul de oraș (pentru RO include și "Sector X")
  orase: string[];
}

const ROMANIA_GEO_URLS = [
  // (legacy) posibil să fi dispărut din upstream
  'https://raw.githubusercontent.com/virgil-av/romania-judete-orase/main/judete-orase.json',
  // (current) structură: { "judete": [ { "nume": "...", "localitati": [ { "nume": "..." } ] } ] }
  'https://raw.githubusercontent.com/virgil-av/judet-oras-localitati-romania/master/judete.json',
];

const COMMON_COUNTRIES = [
  "Romania", "United Kingdom", "United States", "Germany", "France", "Italy", "Spain", "Moldova", "Hungary", "Bulgaria", "Ukraine", "Other"
];

function normalizeForCompare(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizeRomaniaGeo(raw: any): GeoItem[] {
  // legacy: array: [ { nume, orase: [ { nume } ] } ]
  if (Array.isArray(raw)) {
    return raw
      .filter((c: any) => typeof c?.nume === 'string')
      .map((c: any) => {
        const orase: string[] = Array.isArray(c?.orase)
          ? c.orase
              .map((o: { nume?: unknown }) => o?.nume)
              .filter((n: unknown): n is string => typeof n === 'string')
          : [];
        const unique = Array.from(new Set(orase));
        return { nume: c.nume as string, orase: unique.sort() };
      });
  }

  // current: { judete: [ { nume, localitati: [ { nume } ] } ] }
  if (Array.isArray(raw?.judete)) {
    return raw.judete
      .filter((c: any) => typeof c?.nume === 'string')
      .map((c: any) => {
        const orase: string[] = Array.isArray(c?.localitati)
          ? c.localitati
              .map((o: { nume?: unknown }) => o?.nume)
              .filter((n: unknown): n is string => typeof n === 'string')
          : [];
        const unique = Array.from(new Set(orase));
        return { nume: c.nume as string, orase: unique.sort() };
      });
  }

  return [];
}

function LocationCombobox({ 
  value, 
  onChange, 
  options, 
  label, 
  placeholder, 
  disabled = false,
  error 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
  label: string; 
  placeholder: string;
  disabled?: boolean;
  error?: string;
}) {
  const [query, setQuery] = useState('');

  // Dacă nu filtrează nimeni, nu redăm mii de opțiuni (UI devine greoaie).
  const MAX_OPTIONS_INITIAL = 200;
  const filteredOptions =
    query === ''
      ? options.slice(0, MAX_OPTIONS_INITIAL)
      : options.filter((opt) =>
          opt
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <Combobox as="div" value={value} onChange={onChange} disabled={disabled}>
      <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">{label}</Combobox.Label>
      <div className="relative">
        <Combobox.Input
          className={`w-full rounded-md border shadow-sm focus:border-brand-info focus:ring-brand-info sm:text-sm py-2 pl-3 pr-10 ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(item: string) => item}
          placeholder={placeholder}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronsUpDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredOptions.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((item, idx) => (
              <Combobox.Option
                key={idx}
                value={item}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                    active ? 'bg-brand-info text-white' : 'text-gray-900'
                  }`
                }
              >
                {({ active, selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                      {item}
                    </span>
                    {selected && (
                      <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                          active ? 'text-white' : 'text-brand-info'
                        }`}
                      >
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </Combobox>
  );
}

export function LocationSelector({ control, setValue, errors, watch }: LocationSelectorProps) {
  const [romaniaData, setRomaniaData] = useState<GeoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedCountryRaw = watch('country');
  const selectedCountry = typeof selectedCountryRaw === 'string' ? selectedCountryRaw : '';
  const isRomania = ['romania', 'ro'].includes(normalizeForCompare(selectedCountry));
  const selectedCounty = watch('county');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let lastError: unknown = null;
        for (const url of ROMANIA_GEO_URLS) {
          try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            const normalized = normalizeRomaniaGeo(data);
            if (normalized.length === 0) continue;
            setRomaniaData(normalized);
            return;
          } catch (e) {
            lastError = e;
          }
        }
        console.error('Failed to fetch Romania geo data', lastError);
        setRomaniaData([]);
      } catch (e) {
        setRomaniaData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Unele date vechi pot salva `country` ca "RO" în loc de "Romania".
  useEffect(() => {
    if (!selectedCountryRaw) return;
    if (isRomania && selectedCountry !== 'Romania') {
      setValue('country', 'Romania');
    }
  }, [isRomania, selectedCountry, selectedCountryRaw, setValue]);

  const counties = useMemo(() => {
    if (!isRomania) return [];
    return romaniaData.map(c => c.nume).sort();
  }, [romaniaData, isRomania]);

  const cities = useMemo(() => {
    if (!isRomania || !selectedCounty) return [];

    // Match tolerant la diacritice pentru că în datele existente (billingDetails)
    // pot exista variante (ex: București vs Bucureşti).
    const target = normalizeForCompare(String(selectedCounty));
    const county = romaniaData.find(c => normalizeForCompare(c.nume) === target);
    if (!county) return [];
    return county.orase;
  }, [romaniaData, isRomania, selectedCounty]);

  // Effect to clear city when county changes if current city not in new list
  // Actually, we clear city when county changes via the onChange handler in render, 
  // but if county changes programmatically (e.g. from CUI fill), we might need this.
  // We'll rely on the parent or direct handlers for now to avoid loops.

  return (
    <div className="space-y-6 pt-4 border-t border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Adresa de Facturare</h3>

      {/* Full Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresă Completă
        </label>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-info focus:ring-brand-info sm:text-sm py-2 px-3 border placeholder:text-gray-400"
              placeholder="Str. Exemplu Nr. 1, Ap. 2"
            />
          )}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country */}
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <LocationCombobox
              label="Țară"
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                // Only clear if actually changing to prevent clearing on initial load if valid
                if (val !== selectedCountry) {
                    setValue('county', '');
                    setValue('city', '');
                }
              }}
              options={COMMON_COUNTRIES}
              placeholder="Selectează țara"
              error={errors.country?.message}
            />
          )}
        />

        {/* Zip Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cod Poștal (Opțional)
          </label>
          <Controller
            name="zipCode"
            control={control}
            render={({ field }) => (
               <input
                {...field}
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-info focus:ring-brand-info sm:text-sm py-2 px-3 border placeholder:text-gray-400"
                placeholder="010001"
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* County */}
        <Controller
          name="county"
          control={control}
          render={({ field }) => (
            isRomania ? (
              <LocationCombobox
                label="Județ / Sector"
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  if (val !== selectedCounty) {
                      setValue('city', '');
                  }
                }}
                options={counties}
                placeholder="Selectează județ"
                disabled={loading || !selectedCountry}
                error={errors.county?.message}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Județ / Regiune</label>
                <input
                   {...field}
                   type="text"
                   className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-info focus:ring-brand-info sm:text-sm py-2 px-3 border placeholder:text-gray-400"
                   placeholder="Introdu județul"
                />
                 {errors.county && <p className="mt-1 text-sm text-red-600">{errors.county.message}</p>}
              </div>
            )
          )}
        />

        {/* City */}
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
             isRomania ? (
              <LocationCombobox
                label="Oraș"
                value={field.value}
                onChange={field.onChange}
                options={cities}
                placeholder="Selectează oraș"
                // Enable if cities are loaded OR if we are waiting (don't disable abruptly)
                // But mainly enabled if county is selected.
                disabled={!selectedCounty} 
                error={errors.city?.message}
              />
             ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Oraș</label>
                <input
                   {...field}
                   type="text"
                   className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-info focus:ring-brand-info sm:text-sm py-2 px-3 border placeholder:text-gray-400"
                   placeholder="Introdu orașul"
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
              </div>
             )
          )}
        />
      </div>
    </div>
  );
}
