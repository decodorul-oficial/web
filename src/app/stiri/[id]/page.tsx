import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { fetchNewsById } from '@/features/news/services/newsService';
import { Citation } from '@/components/legal/Citation';
import { sanitizeRichText } from '@/lib/html/sanitize';

type PageProps = { params: { id: string } };

export const dynamic = 'force-dynamic';

function extractField<T = string>(content: unknown, key: string): T | undefined {
  if (!content || typeof content !== 'object') return undefined;
  const c: any = content;
  return c?.[key] as T | undefined;
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

export default async function NewsDetailPage(props: PageProps) {
  const { id } = props.params;
  const news = await fetchNewsById(id);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container-responsive flex-1 py-8">
        <div className="mb-6 text-sm">
          <Link href="/" className="text-brand-info hover:underline">
            ← Înapoi la listă
          </Link>
        </div>

        {!news ? (
          <div className="text-gray-500">Știrea nu a fost găsită.</div>
        ) : (
          <article className="space-y-6">
            <header className="space-y-2">
              <h1 className="text-3xl font-bold leading-tight">{news.title}</h1>
              <div className="text-sm text-gray-500">
                {new Date(news.publicationDate).toLocaleString('ro-RO')}
              </div>
              {extractField<string>(news.content, 'author') && (
                <div className="text-sm text-gray-600">Autor: {extractField<string>(news.content, 'author')}</div>
              )}
              {extractField<string>(news.content, 'category') && (
                <div className="text-sm text-gray-600">Categoria: {extractField<string>(news.content, 'category')}</div>
              )}
              {Array.isArray(extractField<string[]>(news.content, 'keywords')) && (
                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                  {extractField<string[]>(news.content, 'keywords')!.map((k) => (
                    <span key={k} className="rounded bg-gray-100 px-2 py-0.5">{k}</span>
                  ))}
                </div>
              )}
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-60 rounded-md bg-gradient-to-br from-brand to-brand-highlight" />
                <section className="prose prose-lg max-w-none">
                  {extractField<string>(news.content, 'summary') && (
                    <p>{extractField<string>(news.content, 'summary')}</p>
                  )}
                  {extractField<string>(news.content, 'body') && (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeRichText(extractField<string>(news.content, 'body')!) }} />
                  )}
                  {typeof news.content === 'string' && <p>{news.content}</p>}
                </section>
                <div>
                  <Citation {...getCitationFields(news.content)} />
                </div>
              </div>
              <aside className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Meta</h3>
                <div className="rounded border p-4 text-sm text-gray-700">
                  <div><span className="text-gray-500">ID:</span> {news.id}</div>
                  <div><span className="text-gray-500">Publicat:</span> {new Date(news.publicationDate).toLocaleDateString('ro-RO')}</div>
                  {news.createdAt && (
                    <div><span className="text-gray-500">Creat:</span> {new Date(news.createdAt).toLocaleString('ro-RO')}</div>
                  )}
                  {news.updatedAt && (
                    <div><span className="text-gray-500">Actualizat:</span> {new Date(news.updatedAt).toLocaleString('ro-RO')}</div>
                  )}
                </div>
              </aside>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}


