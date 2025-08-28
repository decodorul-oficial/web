'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { fetchCategories, fetchStiriByCategorySlug } from '@/features/news/services/newsService';
import { NewsItem } from '@/features/news/types';
import { createNewsSlug } from '@/lib/utils/slugify';
import { Eye, ChevronLeft, ChevronRight, Gavel } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { stripHtml } from '@/lib/html/sanitize';
import { Citation } from '@/components/legal/Citation';
import { extractParteaFromFilename } from '@/lib/utils/monitorulOficial';

type PageProps = {
  params: { slug: string };
};

function formatCategorySlugToName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ro-RO', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = params;
  const searchParams = useSearchParams();
  const router = useRouter();

  const categorySlug = useMemo(() => slug, [slug]);
  const pageParam = Number(searchParams.get('page') || '1');
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    currentPage: 1,
    totalPages: 1
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchStiriByCategorySlug({ slug: categorySlug, limit, offset })
      .then((res) => {
        if (!mounted) return;
        setItems(res.stiri);
        setPagination(res.pagination);
      })
      .catch((e) => {
        if (!mounted) return;
        setError('A apărut o eroare la încărcarea știrilor.');
        console.error('Category page load error:', e);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [categorySlug, offset]);

  const [displayName, setDisplayName] = useState<string>(slug);
  useEffect(() => {
    let mounted = true;
    fetchCategories(100)
      .then((cats) => {
        if (!mounted) return;
        const match = cats.find((c) => c.slug === categorySlug);
        if (match) setDisplayName(match.name);
        else setDisplayName(categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()));
      })
      .catch(() => setDisplayName(categorySlug));
    return () => { mounted = false; };
  }, [categorySlug]);

  const goToPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('page', String(p));
    router.push(`/categorii/${slug}?${sp.toString()}`);
  };

  const title = `Știri ${formatCategorySlugToName(displayName)}`;

  function getSummary(content: unknown): string | undefined {
    if (!content) return undefined;
    try {
      const c = (() => {
        const raw = content as any;
        if (typeof raw === 'string') {
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        }
        return raw;
      })();
      const raw = c.body || c.summary || c.text || (typeof c === 'string' ? c : undefined);
      return typeof raw === 'string' ? stripHtml(raw) : raw;
    } catch {
      return undefined;
    }
  }

  function getCitationFields(content: unknown, filename?: string) {
    const c = (() => {
      const raw = content as any;
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch {
          return {} as any;
        }
      }
      return (raw ?? {}) as any;
    })();
    const extractedPartea = extractParteaFromFilename(filename);
    return {
      act: c?.act || c?.actName || undefined,
      partea: extractedPartea || c?.partea || 'Partea I',
      numarSiData: c?.monitorulOficial || c?.moNumberDate || undefined,
      sourceUrl: c?.sourceUrl || c?.url || undefined
    } as const;
  }

  function toPascalCase(value: string): string {
    return value
      .split(/[\s-_]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }

  function getLucideIconForContent(content: unknown, fallback: LucideIcon): LucideIcon {
    try {
      const c = (() => {
        const raw = content as any;
        if (typeof raw === 'string') {
          try {
            return JSON.parse(raw);
          } catch {
            return {} as any;
          }
        }
        return (raw ?? {}) as any;
      })();
      const iconName = c?.lucide_icon ?? c?.lucideIcon;
      if (typeof iconName === 'string' && iconName.trim().length > 0) {
        const candidates = Array.from(new Set([
          iconName,
          toPascalCase(iconName),
          iconName.charAt(0).toUpperCase() + iconName.slice(1),
          iconName.replace(/[-_ ]+/g, '')
        ]));
        for (const candidate of candidates) {
          const Icon = (LucideIcons as Record<string, unknown>)[candidate];
          if (Icon) return Icon as LucideIcon;
        }
      }
    } catch {}
    return fallback;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-responsive flex-1 py-6">
        <div className="mb-6">
          <nav className="text-sm text-gray-500" aria-label="breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:underline">Acasă</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/categorii" className="hover:underline">Categorii</Link>
              </li>
              <li>/</li>
              <li className="text-gray-700">{formatCategorySlugToName(displayName)}</li>
            </ol>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Se încarcă...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Nu există știri în această categorie.</div>
        ) : (
          <div className="divide-y">
            {items.map((n) => (
              <div key={n.id}>
                <article className="flex gap-3 py-4">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 flex items-center justify-center">
                      {(() => {
                        const Icon = getLucideIconForContent(n.content, Gavel);
                        return <Icon className="h-6 w-6 text-white" />;
                      })()}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {formatDate(n.publicationDate)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-2 font-semibold">
                      <Link 
                        href={`/stiri/${createNewsSlug(n.title, n.id)}`} 
                        className="hover:underline"
                      >
                        {n.title}
                      </Link>
                    </h4>
                    <p className="line-clamp-2 text-sm text-gray-600 mb-2">{getSummary(n.content)?.slice(0, 180)}...</p>
                    <div className="mt-1 text-xs text-gray-600">
                      <Citation {...getCitationFields(n.content, (n as any).filename)} />
                    </div>
                  </div>
                </article>
              </div>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="Pagina anterioară"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-sm text-gray-600">
                  Pagina {page} din {pagination.totalPages}
                </div>
                <button
                  onClick={() => goToPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="Pagina următoare"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}


