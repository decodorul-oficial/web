import Link from 'next/link';
import { fetchLatestNews } from '@/features/news/services/newsService';
import { Citation } from '@/components/legal/Citation';
import { stripHtml } from '@/lib/html/sanitize';
import { MostReadNewsSection } from './MostReadNewsSection';
import { Gavel, Landmark } from 'lucide-react';
import { createNewsSlug } from '@/lib/utils/slugify';

export async function LatestNewsSection() {
  const { stiri } = await fetchLatestNews({ limit: 10, orderBy: 'id', orderDirection: 'desc' });

  const [featured, ...rest] = stiri;

  function getSummary(content: unknown): string | undefined {
    if (!content) return undefined;
    try {
      const c = content as any;
      const raw = c.summary || c.body || c.text || (typeof c === 'string' ? c : undefined);
      return typeof raw === 'string' ? stripHtml(raw) : raw;
    } catch {
      return undefined;
    }
  }

  function getCitationFields(content: unknown) {
    const c = (content ?? {}) as any;
    return {
      act: c?.act || c?.actName || undefined,
      partea: c?.partea || 'Partea I',
      numarSiData: c?.monitorulOficial || c?.moNumberDate || undefined,
      sourceUrl: c?.sourceUrl || c?.url || undefined
    } as const;
  }

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {featured && (
            <article className="mb-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="h-48 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 md:h-full flex items-center justify-center">
                  <Landmark className="h-16 w-16 text-white" />
                </div>
                <div className="md:col-span-2">
                  <h2 className="mb-3 text-xl font-bold">
                    <Link href={`/stiri/${createNewsSlug(featured.title, featured.id)}`} className="hover:underline">
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="mb-4 text-gray-600">{getSummary(featured.content)?.slice(0, 350)}...</p>
                  <div className="mb-4 text-sm text-gray-500">
                    {new Date(featured.publicationDate).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                  <Citation {...getCitationFields(featured.content)} />
                </div>
              </div>
            </article>
          )}
        </div>

        <div className="space-y-6">
          <MostReadNewsSection />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Latest News</h3>
        <div className="divide-y">
          {rest.map((n) => (
            <article key={n.id} className="flex gap-3 py-4">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 flex items-center justify-center">
                  <Gavel className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2 text-xs text-gray-500">
                  {new Date(n.publicationDate).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <h4 className="mb-2 font-semibold">
                  <Link href={`/stiri/${createNewsSlug(n.title, n.id)}`} className="hover:underline">
                    {n.title}
                  </Link>
                </h4>
                <p className="line-clamp-2 text-sm text-gray-600 mb-2">{getSummary(n.content)?.slice(0, 180)}...</p>
                <div>
                  <Citation {...getCitationFields(n.content)} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


