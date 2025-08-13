"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems: { href: string; label: string }[] = [
  { href: '/', label: 'Acasă' },
  { href: '/categorii/administratie', label: 'Category 1' },
  { href: '/categorii/economie', label: 'Category 2' },
  { href: '/categorii/legislatie', label: 'Category 3' },
  { href: '/join', label: 'Join' },
  { href: '/login', label: 'Login' }
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="container-responsive flex h-[var(--header-height)] items-center justify-between">
        <Link href="/" className="font-bold tracking-tight">
          Decodorul Oficial
        </Link>
        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => {
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


