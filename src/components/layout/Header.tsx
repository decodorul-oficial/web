"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems: { href: string; label: string }[] = [
  { href: '/', label: 'Acasă' },
  // slot for dropdown "Category"
  { href: '/categorii/administratie', label: 'Category' },
  { href: '/categorii/economie', label: 'Category 2' },
  { href: '/categorii/legislatie', label: 'Category 3' },
  { href: '/join', label: 'Join' },
  { href: '/login', label: 'Login' }
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
            className={`text-sm font-medium transition-colors hover:text-brand-info ${pathname === navItems[0].href ? 'text-brand-info' : 'text-gray-600'}`}
          >
            {navItems[0].label}
          </Link>

          {/* Category Dropdown */}
          <div className="relative" ref={dropdownRef} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button
              type="button"
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-brand-info ${pathname?.startsWith('/categorii') ? 'text-brand-info' : 'text-gray-600'}`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
            >
              Category
              <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
              </svg>
            </button>
            {open && (
              <div className="absolute left-0 top-full z-50 w-56 rounded-md border bg-white p-2 shadow-lg">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categorii/${cat.slug}` as any}
                    className="flex items-center gap-2 rounded px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-info"
                    onClick={() => setOpen(false)}
                  >
                    <CategoryIcon slug={cat.slug} />
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Keep other links */}
          {navItems.slice(2).map((item) => {
            const active = pathname === item.href;
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
        </nav>
      </div>
    </header>
  );
}


