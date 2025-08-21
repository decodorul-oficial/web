"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { getGraphQLClient } from '@/lib/graphql/client';
import { SEARCH_STIRI } from '@/features/news/graphql/queries';
import { ensureSessionCookie } from '@/lib/utils/sessionCookie';
import { trackSearch } from '@/lib/analytics';

type SpotlightItem = {
  id: string;
  title: string;
  publicationDate: string;
  content?: any;
};

export function SearchSpotlight() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SpotlightItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple LRU-like cache with TTL
  const cacheRef = useRef<Map<string, { ts: number; data: { items: SpotlightItem[]; total: number } }>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const lastCompletedRef = useRef<string>('');

  const keyFor = (q: string, lim: number, off: number, ob: string, od: 'asc' | 'desc') => `${q}|${lim}|${off}|${ob}|${od}`;

  // Reset query when panel closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setItems([]);
      setTotal(0);
      setOffset(0);
      setError(null);
    }
  }, [open]);

  const runSearch = useCallback(async (q: string, lim: number, off: number, ob: string, od: 'asc' | 'desc', append: boolean = false) => {
    if (q.length < 2) {
      setItems([]);
      setTotal(0);
      setOffset(0);
      setError(null);
      return;
    }

    const clampedLimit = Math.max(1, Math.min(100, lim));
    const cacheKey = keyFor(q, clampedLimit, off, ob, od);

    // Cache hit with TTL 45s
    const now = Date.now();
    const cached = cacheRef.current.get(cacheKey);
    if (cached && now - cached.ts < 45_000) {
      if (append) {
        setItems((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = cached.data.items.filter((it) => !existingIds.has(it.id));
          return [...prev, ...newUnique];
        });
      } else {
        setItems(cached.data.items);
      }
      setTotal(cached.data.total);
      lastCompletedRef.current = cacheKey;
      setError(null);
      return;
    }

    // Same as last completed → skip
    if (lastCompletedRef.current === cacheKey) return;

    // Cancel previous
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    
    // Asigură că cookie-ul mo_session este setat pentru analytics
    ensureSessionCookie();
    
    try {
      const client = getGraphQLClient({
        getAuthToken: () => (typeof window !== 'undefined' ? localStorage.getItem('DO_TOKEN') ?? undefined : undefined)
      });
      // graphql-request nu primește AbortSignal direct; folosim fetch polyfill prin setHeader + abort manual
      (client as any).setHeader('Authorization', `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('DO_TOKEN') ?? '' : ''}`);
      (client as any).setHeader('Content-Type', 'application/json');

      const dataPromise = client.request<{ searchStiri: { stiri: SpotlightItem[]; pagination: { totalCount: number } } }>(
        SEARCH_STIRI,
        { query: q, limit: clampedLimit, offset: off, orderBy: 'id', orderDirection: 'desc' }
      );
      const data = (await Promise.race([
        dataPromise,
        new Promise((_, reject) => controller.signal.addEventListener('abort', () => reject(new Error('aborted'))))
      ])) as { searchStiri: { stiri: SpotlightItem[]; pagination: { totalCount: number } } };
      const itemsNew = data.searchStiri.stiri;
      const totalNew = data.searchStiri.pagination?.totalCount ?? itemsNew.length;
      if (append) {
        setItems((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = itemsNew.filter((it) => !existingIds.has(it.id));
          return [...prev, ...newUnique];
        });
      } else {
        setItems(itemsNew);
      }
      setTotal(totalNew);
      cacheRef.current.set(cacheKey, { ts: now, data: { items: itemsNew, total: totalNew } });
      lastCompletedRef.current = cacheKey;
      
      // Track search event
      if (!append) trackSearch(q, totalNew);
    } catch (e: any) {
      const code = e?.response?.errors?.[0]?.code;
      if (code === 'VALIDATION_ERROR') setError('Limita nu poate depăși 100 sau parametrii nu sunt validați.');
      else if (code === 'RATE_LIMIT_EXCEEDED') setError('Ai atins limita de rată. Te rugăm să încerci din nou în scurt timp.');
      else setError('A apărut o eroare. Încearcă din nou.');
    } finally {
      setBusy(false);
    }
  }, []);

  // Debounce 500ms
  useEffect(() => {
    const id = setTimeout(() => {
      runSearch(query.trim(), 10, 0, 'id', 'desc', false);
    }, 500);
    return () => clearTimeout(id);
  }, [query, runSearch]);

  // Reset pagination when query changes
  useEffect(() => {
    setOffset(0);
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleClearQuery = () => {
    setQuery('');
  };

  return (
    <div className="relative">
      <button
        aria-label="Căutare"
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:text-brand-info"
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 20l-5.8-5.8a7 7 0 10-1.4 1.4L20 21l1-1zM5 10a5 5 0 1110 0A5 5 0 015 10z" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/40 p-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="mt-20 w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 border-b p-3">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 20l-5.8-5.8a7 7 0 10-1.4 1.4L20 21l1-1zM5 10a5 5 0 1110 0A5 5 0 015 10z" />
                </svg>
                <div className="relative flex-1">
                  <input
                    autoFocus
                    placeholder="Caută în știri (⌘K)"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 pr-8"
                    style={{ fontSize: '16px' }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setOpen(false);
                    }}
                  />
                  {query && (
                    <button
                      onClick={handleClearQuery}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      aria-label="Șterge căutarea"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {error && <div className="p-4 text-sm text-red-600">{error}</div>}
                {!error && query && total === 0 && !busy && (
                  <div className="p-4 text-sm text-gray-500">Nicio știre găsită.</div>
                )}
                {items.map((r) => (
                  <Link
                    key={r.id}
                    href={`/stiri/${r.id}`}
                    className="block border-b p-4 hover:bg-gray-50"
                    onClick={() => {
                      setOpen(false);
                      // Nu mai pornim manual loader-ul - NavigationInterceptor se va ocupa de asta
                      // Lăsăm Next.js să gestioneze tranziția; interceptor-ul va reseta la schimbarea pathname-ului
                    }}
                  >
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(r.publicationDate).toLocaleDateString('ro-RO')}
                    </div>
                    {(r as any).content && (
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
                        {((r as any).content?.summary || (r as any).content?.body) && (
                          <span className="line-clamp-1 max-w-full text-gray-700">
                            {(r as any).content?.summary || String((r as any).content?.body ?? '').replace(/<[^>]+>/g, '').slice(0, 140)}
                          </span>
                        )}
                        {(r as any).content?.category && (
                          <span className="rounded bg-gray-100 px-2 py-0.5">{(r as any).content.category}</span>
                        )}
                        {Array.isArray((r as any).content?.keywords) && (r as any).content.keywords.slice(0, 3).map((k: string) => (
                          <span key={k} className="rounded bg-gray-100 px-2 py-0.5">{k}</span>
                        ))}
                        {(r as any).content?.author && (
                          <span className="ml-auto text-gray-500">Autor: {(r as any).content.author}</span>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
                {busy && <div className="p-4 text-sm text-gray-500">Se caută…</div>}
                {!busy && items.length >= 10 && items.length < total && (
                  <button
                    className="block w-full p-3 text-center text-sm text-brand-info hover:bg-gray-50"
                    onClick={() => {
                      const nextOffset = offset + 10;
                      setOffset(nextOffset);
                      runSearch(query.trim(), 10, nextOffset, 'id', 'desc', true);
                    }}
                  >
                    Încarcă mai multe
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}


