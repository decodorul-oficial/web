import Link from 'next/link';
import { fetchLatestNews } from '@/features/news/services/newsService';
import { Citation } from '@/components/legal/Citation';
import { stripHtml } from '@/lib/html/sanitize';

export async function LatestNewsSection() {
  const { stiri } = await fetchLatestNews({ limit: 10, orderBy: 'publicationDate', orderDirection: 'desc' });

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
          {featured ? (
            <article className="grid grid-cols-5 gap-6">
              <div className="col-span-2 h-48 rounded-md bg-gradient-to-br from-brand to-brand-highlight" />
              <div className="col-span-3">
                <h2 className="text-2xl font-bold leading-tight">
                  <Link href={`/stiri/${featured.id}`} className="hover:underline">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-gray-600">{getSummary(featured.content)?.slice(0, 160)}</p>
                <div className="mt-3 text-xs text-gray-500">{new Date(featured.publicationDate).toLocaleDateString('ro-RO')}</div>
                <div className="mt-2">
                  <Citation {...getCitationFields(featured.content)} />
                </div>
              </div>
            </article>
          ) : (
            <div className="text-gray-500">Nu există știri momentan.</div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Most reads</h3>
          <ul className="space-y-4">
            {rest.slice(0, 4).map((n) => (
              <li key={n.id} className="flex items-start gap-3">
                <div className="h-12 w-12 shrink-0 rounded bg-gradient-to-br from-brand-accent to-brand-info/60" />
                <div>
                  <p className="line-clamp-2 text-sm font-medium">
                    <Link href={`/stiri/${n.id}`} className="hover:underline">
                      {n.title}
                    </Link>
                  </p>
                  <p className="line-clamp-2 text-xs text-gray-500">{getSummary(n.content)?.slice(0, 90)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">More news</h3>
        <div className="divide-y">
          {rest.map((n) => (
            <article key={n.id} className="grid grid-cols-5 gap-4 py-4">
              <div className="col-span-1 text-xs text-gray-500">
                {new Date(n.publicationDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="col-span-4">
                <h4 className="font-semibold">
                  <Link href={`/stiri/${n.id}`} className="hover:underline">
                    {n.title}
                  </Link>
                </h4>
                <p className="line-clamp-2 text-sm text-gray-600">{getSummary(n.content)?.slice(0, 180)}</p>
                <div className="mt-1">
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


