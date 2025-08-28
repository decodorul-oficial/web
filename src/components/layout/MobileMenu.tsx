"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchCategories } from '@/features/news/services/newsService';

type Category = { slug: string; name: string; count: number };

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    const el = document.querySelector('.disclaimer-banner') as HTMLElement | null;
    if (!el) return;
    if (open) el.style.display = 'none';
    else el.style.display = '';
    return () => {
      if (el) el.style.display = '';
    };
  }, [open]);
  
  useEffect(() => {
    let mounted = true;
    fetchCategories(100)
      .then((cats) => {
        if (!mounted) return;
        const mapped = cats.map((c) => ({ slug: c.slug, name: c.name, count: c.count }));
        setCategories(mapped);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);
  
  return (
    <div className="flex items-center gap-3 md:hidden">
      {/* Search button visible on mobile */}
      <div>
        {/* Reuse spotlight trigger by rendering its button only */}
        {/* For simplicity, we mount full component; it renders just the icon until opened */}
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <></>
      </div>
      <button
        aria-label="Deschide meniul"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-md border text-gray-700"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
        </svg>
      </button>
      {open &&
        createPortal(
          <div className="fixed left-0 right-0 bottom-0 top-[var(--header-height)] z-[1000] bg-white/80 backdrop-blur" onClick={() => setOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-full p-4 overflow-y-auto overscroll-contain" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-semibold">Meniu</span>
                <button className="p-1" onClick={() => setOpen(false)} aria-label="Închide">
                  ✕
                </button>
              </div>
              <nav className="space-y-2 text-base">
                <Link href="/" className="block rounded px-2 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Acasă
                </Link>
                <Link href="/stiri" className="block rounded px-2 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Căutare Avansată
                </Link>
                <Link href="/sinteza-zilnica" className="block rounded px-2 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Sinteza Zilnică
                </Link>
                {categories.length > 0 && (
                  <details>
                    <summary className="cursor-pointer select-none rounded px-2 py-2 hover:bg-gray-50">Categorii</summary>
                    <div className="ml-2 mt-1">
                      {categories.map((c, idx) => (
                        <div key={c.slug} className={`border-b border-gray-200 ${idx === categories.length - 1 ? 'border-b-0' : ''}`}>
                          <Link
                            href={`/categorii/${c.slug}`}
                            className="block px-2 py-2 hover:bg-gray-50 capitalize"
                            onClick={() => setOpen(false)}
                          >
                            {c.name} <span className="text-xs text-gray-500">({c.count})</span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </nav>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}


