"use client";
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Fuse from 'fuse.js';
import Link from 'next/link';
import { fetchLatestNews } from '@/features/news/services/newsService';

type SpotlightItem = {
  id: string;
  title: string;
  publicationDate: string;
  content: unknown;
};

export function SearchSpotlight() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SpotlightItem[]>([]);

  useEffect(() => {
    // preload some items for client-side fuzzy search; can be replaced by server API later
    fetchLatestNews({ limit: 200, orderBy: 'publicationDate', orderDirection: 'desc' })
      .then(({ stiri }) => setItems(stiri))
      .catch(() => setItems([]));
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(items, {
      includeScore: true,
      threshold: 0.35,
      keys: [
        'title',
        'publicationDate',
        'content.summary',
        'content.body',
        'content.category',
        'content.keywords'
      ] as any
    });
  }, [items]);

  const results = useMemo(() => {
    if (!query) return [] as SpotlightItem[];
    return fuse.search(query).slice(0, 8).map((r) => r.item as SpotlightItem);
  }, [fuse, query]);

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
                <input
                  autoFocus
                  placeholder="Caută în știri (⌘K)"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false);
                  }}
                />
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {query && results.length === 0 && (
                  <div className="p-4 text-sm text-gray-500">Niciun rezultat.</div>
                )}
                {results.map((r) => (
                  <Link
                    key={r.id}
                    href={`/stiri/${r.id}`}
                    className="block border-b p-4 hover:bg-gray-50"
                    onClick={() => setOpen(false)}
                  >
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500">{new Date(r.publicationDate).toLocaleString('ro-RO')}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}


