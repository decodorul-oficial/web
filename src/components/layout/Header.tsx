"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SearchSpotlight } from '@/components/search/SearchSpotlight';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { usePathname } from 'next/navigation';

const navItems: { href: string; label: string }[] = [
  { href: '/', label: 'Acasă' },
  { href: '/stiri', label: 'Căutare Avansată' },
  { href: '/sinteza-zilnica', label: 'Sinteza Zilnică' },
  // slot for dropdown "Category"
  //{ href: '/categorii/administratie', label: 'Category' },
  //{ href: '/categorii/economie', label: 'Category 2' },
  //{ href: '/categorii/legislatie', label: 'Category 3' },
  //{ href: '/join', label: 'Join' },
  //{ href: '/login', label: 'Login' }
];

const categories = [
  { slug: 'administratie', name: 'Administrație' },
  { slug: 'economie', name: 'Economie' },
  { slug: 'legislatie', name: 'Legislație' },
  { slug: 'transport', name: 'Transport' },
  { slug: 'energie', name: 'Energie' }
];

function CategoryIcon({ slug }: { slug: string }) {
  const common = 'h-4 w-4 text-brand-info';
  switch (slug) {
    case 'administratie':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 10h18v2H3v-2Zm2 4h14v6H5v-6Zm-.5-9h15l1.5 3H3l1.5-3Z" />
        </svg>
      );
    case 'economie':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 18h16v2H4v-2Zm3-4h2v3H7v-3Zm4-6h2v9h-2V8Zm4 3h2v6h-2v-6Z" />
        </svg>
      );
    case 'legislatie':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 4h10v2H7V4Zm-2 4h14l-1 12H6L5 8Zm3 2v8h2v-8H8Zm6 0v8h2v-8h-2Z" />
        </svg>
      );
    case 'transport':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11v6h-2a2 2 0 11-4 0H11a2 2 0 11-4 0H5v-6Zm3.4-4a.5.5 0 00-.48.35L7.3 9h9.4l-.62-1.65A.5.5 0 0015.6 7H8.4Z" />
        </svg>
      );
    case 'energie':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13 2L4 14h6v8l9-12h-6V2Z" />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M17.414 10.586l-6.999 6.999a2 2 0 01-2.828 0L2 12.999V8a2 2 0 012-2h4.999l5.586 5.586a2 2 0 010 2.828zM7 7a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      );
  }
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);
  
  // Ensure pathname is always defined before using it
  const safePathname = pathname || '';
  
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="container-responsive flex h-[var(--header-height)] items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold tracking-tight">
          <Image src="/logo.png" alt="Decodorul Oficial" width={32} height={32} className="h-8 w-8 object-contain" />
          Decodorul Oficial
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {/* Home */}
          <Link
            href={navItems[0].href as any}
            className={`text-sm font-medium transition-colors hover:text-brand-info ${safePathname === navItems[0].href ? 'text-brand-info' : 'text-gray-600'}`}
          >
            {navItems[0].label}
          </Link>

          {/* Cautare Avansata */}
          <Link
            href={navItems[1].href as any}
            className={`text-sm font-medium transition-colors hover:text-brand-info ${safePathname === navItems[1].href ? 'text-brand-info' : 'text-gray-600'}`}
          >
            {navItems[1].label}
          </Link>

          {/* Keep other links */}
          {navItems.slice(2).map((item) => {
            const active = safePathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={`text-sm font-medium transition-colors hover:text-brand-info ${active ? 'text-brand-info' : 'text-gray-600'}`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Search */}
          <SearchSpotlight />

        </nav>
        <div className="md:hidden flex items-center gap-2">
          <SearchSpotlight />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}


