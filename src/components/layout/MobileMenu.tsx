"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const categories = [
  { slug: 'administratie', name: 'Administrație' },
  { slug: 'economie', name: 'Economie' },
  { slug: 'legislatie', name: 'Legislație' },
  { slug: 'transport', name: 'Transport' },
  { slug: 'energie', name: 'Energie' }
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const el = document.querySelector('.disclaimer-banner') as HTMLElement | null;
    if (!el) return;
    if (open) el.style.display = 'none';
    else el.style.display = '';
    return () => {
      if (el) el.style.display = '';
    };
  }, [open]);
  
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
            <div className="absolute left-0 top-0 h-full w-full p-4" onClick={(e) => e.stopPropagation()}>
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
                {/* comentez butoanele
                <details open>
                  <summary className="cursor-pointer select-none rounded px-2 py-2 hover:bg-gray-50">Category</summary>
                  <div className="ml-2 mt-1 space-y-1">
                    {categories.map((c) => (
                      <Link key={c.slug} href={`/categorii/${c.slug}`} className="block rounded px-2 py-1 hover:bg-gray-50" onClick={() => setOpen(false)}>
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </details>
                
                <Link href="/join" className="block rounded px-2 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Join
                </Link>
                <Link href="/login" className="block rounded px-2 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Login
                </Link>*/}
              </nav>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}


