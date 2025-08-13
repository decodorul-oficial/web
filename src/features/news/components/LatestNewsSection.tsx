import { fetchLatestNews } from '@/features/news/services/newsService';

export async function LatestNewsSection() {
  const { stiri } = await fetchLatestNews({ limit: 10 });

  const [featured, ...rest] = stiri;

  function getSummary(content: unknown): string | undefined {
    if (!content) return undefined;
    try {
      const c = content as any;
      return c.summary || c.body || c.text || (typeof c === 'string' ? c : undefined);
    } catch {
      return undefined;
    }
  }

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {featured ? (
            <article className="grid grid-cols-5 gap-6">
              <div className="col-span-2 h-48 rounded-md bg-gradient-to-br from-brand to-brand-highlight" />
              <div className="col-span-3">
                <h2 className="text-2xl font-bold leading-tight">{featured.title}</h2>
                <p className="mt-2 line-clamp-3 text-gray-600">{getSummary(featured.content)?.slice(0, 160)}</p>
                <div className="mt-3 text-xs text-gray-500">{new Date(featured.publicationDate).toLocaleDateString('ro-RO')}</div>
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
                  <p className="line-clamp-2 text-sm font-medium">{n.title}</p>
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
                {new Date(n.publicationDate).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
              </div>
              <div className="col-span-4">
                <h4 className="font-semibold">{n.title}</h4>
                <p className="line-clamp-2 text-sm text-gray-600">{getSummary(n.content)?.slice(0, 180)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


