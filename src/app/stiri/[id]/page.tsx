import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { fetchNewsById, fetchNewsByDate } from '@/features/news/services/newsService';
import { Citation } from '@/components/legal/Citation';
import { sanitizeRichText } from '@/lib/html/sanitize';
import { NavigationEndBeacon } from '@/components/ui/NavigationEndBeacon';
import { SameDayNewsSection } from '@/features/news/components/SameDayNewsSection';
import { NewsViewTracker } from '@/features/news/components/NewsViewTracker';
import { NewsViewStats } from '@/features/news/components/NewsViewStats';
import { Rss } from 'lucide-react';

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
  
  // Obținem știrile din aceeași zi
  let sameDayNews: any[] = [];
  if (news) {
    sameDayNews = await fetchNewsByDate(news.publicationDate, id, 5);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* ensure we always end overlay on the client when this page is rendered */}
      <NavigationEndBeacon />
      <main className="container-responsive flex-1 py-8">
        <div className="mb-6 text-sm">
          <Link href="/" className="text-brand-info hover:underline">
            ← Înapoi la listă
          </Link>
        </div>

        {!news ? (
          <div className="text-gray-500">Știrea nu a fost găsită.</div>
        ) : (
          <>
            {/* Track news view */}
            <NewsViewTracker newsId={id} />
            
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
                  <div className="h-60 rounded-md bg-gradient-to-br from-brand to-brand-highlight">
                    <div className="flex items-center justify-center h-full">
                      <Rss className="h-16 w-16 text-white" />
                    </div>
                  </div>
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
                <aside className="space-y-6">
                  {/* Statistics section */}
                  <NewsViewStats news={news} />
                  
                  {/* Secțiunea cu știrile din aceeași zi */}
                  {sameDayNews.length > 0 && (
                    <div className="mt-12">
                      <SameDayNewsSection news={sameDayNews} currentNewsId={id} />
                    </div>
                  )}
                </aside>
              </div>
            </article>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}


