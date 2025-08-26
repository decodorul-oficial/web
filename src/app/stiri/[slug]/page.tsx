import Link from 'next/link';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { fetchNewsById, fetchNewsByDate } from '@/features/news/services/newsService';
import { Citation } from '@/components/legal/Citation';
import { sanitizeRichText } from '@/lib/html/sanitize';
import { NavigationEndBeacon } from '@/components/ui/NavigationEndBeacon';
import { SameDayNewsSection } from '@/features/news/components/SameDayNewsSection';
import { NewsViewStats } from '@/features/news/components/NewsViewStats';
import { extractIdFromSlug, isValidNewsSlug, createNewsSlug } from '@/lib/utils/slugify';
import { Rss } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';
import { NewsViewTrackingWrapper } from '@/features/news/components/NewsViewTrackingWrapper';
import { extractParteaFromFilename } from '@/lib/utils/monitorulOficial';
import { NewsletterCtaInline } from '@/components/newsletter/NewsletterCtaInline';
import { TablesRenderer } from '@/features/news/components/TablesRenderer';
import { ShareButtons, FloatingShareSidebar, ArticleShareSection } from '@/components/ui/ShareButtons';


type PageProps = { params: { slug: string } };

export const dynamic = 'force-dynamic';

function extractField<T = string>(content: unknown, key: string): T | undefined {
  if (!content || typeof content !== 'object') return undefined;
  const c: any = content;
  return c?.[key] as T | undefined;
}

function getCitationFields(content: unknown, filename?: string) {
  const c = (content ?? {}) as any;
  
  // Extract partea from filename if available, otherwise fallback to content or default
  const extractedPartea = extractParteaFromFilename(filename);
  
  return {
    act: c?.act || c?.actName || undefined,
    partea: extractedPartea || c?.partea || 'Partea I',
    numarSiData: c?.monitorulOficial || c?.moNumberDate || undefined,
    sourceUrl: c?.sourceUrl || c?.url || undefined
  } as const;
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  
  let id: string;
  let news: any;
  
  // Check if this is a numeric ID (old format)
  if (/^\d+$/.test(slug)) {
    id = slug;
    news = await fetchNewsById(id);
  } else if (isValidNewsSlug(slug)) {
    const extractedId = extractIdFromSlug(slug);
    if (extractedId) {
      id = extractedId;
      news = await fetchNewsById(id);
    }
  }
  
  if (!news) {
    return {
      title: 'Știrea nu a fost găsită | Decodorul Oficial',
      description: 'Știrea căutată nu a fost găsită pe site-ul Decodorul Oficial.',
    };
  }

  const title = news.title;
  const summary = extractField<string>(news.content, 'summary') || news.title;
  const publicationDate = new Date(news.publicationDate);
  const formattedDate = publicationDate.toLocaleDateString('ro-RO', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  const keywords = [
    'Monitorul Oficial',
    'legislație română',
    'acte normative',
    'hotărâri de guvern',
    'ordine ministeriale',
    'legi românia',
    'buletin oficial',
    'publicații oficiale',
    'decodor legislație',
    'sinteze legislative',
    'interpretări legale',
    'actualizări legislative',
    'coduri românia',
    'regulamente românia',
    'știri legislative',
    'monitor oficial românia',
    ...(Array.isArray(extractField<string[]>(news.content, 'keywords')) 
      ? extractField<string[]>(news.content, 'keywords')! 
      : [])
  ];

  return {
    title: `${title} | Decodorul Oficial`,
    description: summary,
    keywords: keywords,
    authors: [{ name: extractField<string>(news.content, 'author') || 'Decodorul Oficial' }],
    openGraph: {
      title: title,
      description: summary,
      type: 'article',
      publishedTime: news.publicationDate,
      modifiedTime: news.updatedAt || news.publicationDate,
      authors: [extractField<string>(news.content, 'author') || 'Decodorul Oficial'],
      section: extractField<string>(news.content, 'category') || 'Legislație',
      tags: Array.isArray(extractField<string[]>(news.content, 'keywords')) 
        ? extractField<string[]>(news.content, 'keywords')! 
        : [],
      images: [
        {
          url: '/logo_with_bg.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: summary,
      images: ['/logo_with_bg.png'],
    },
    alternates: {
      canonical: `/stiri/${createNewsSlug(news.title, news.id)}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'article:published_time': news.publicationDate,
      'article:modified_time': news.updatedAt || news.publicationDate,
      'article:author': extractField<string>(news.content, 'author') || 'Decodorul Oficial',
      'article:section': extractField<string>(news.content, 'category') || 'Legislație',
      'article:tag': Array.isArray(extractField<string[]>(news.content, 'keywords')) 
        ? extractField<string[]>(news.content, 'keywords')!.join(', ') 
        : '',
    },
  };
}

export default async function NewsDetailPage(props: PageProps) {
  const { slug } = props.params;
  
  let id: string;
  let news: any;
  
  // Check if this is a numeric ID (old format)
  if (/^\d+$/.test(slug)) {
    // Old format: /stiri/98
    id = slug;
    news = await fetchNewsById(id);
    
    if (!news) {
      notFound();
    }
    
    // Redirect to new slug format
    const newSlug = createNewsSlug(news.title, id);
    redirect(`/stiri/${newSlug}`);
  }
  
  // New format: /stiri/title-slug-98
  if (!isValidNewsSlug(slug)) {
    notFound();
  }
  
  // Extract ID from slug
  const extractedId = extractIdFromSlug(slug);
  if (!extractedId) {
    notFound();
  }
  id = extractedId;
  
  news = await fetchNewsById(id);
  
  if (!news) {
    notFound();
  }
  
  // Check if the current slug matches the expected slug for this news
  const expectedSlug = createNewsSlug(news.title, id);
  if (slug !== expectedSlug) {
    // Redirect to the correct slug
    redirect(`/stiri/${expectedSlug}`);
  }

  // Obținem știrile din aceeași zi - optimizat pentru a fi mai rapid
  let sameDayNews: any[] = [];
  if (news) {
    // Folosim Promise.all pentru a încărca datele în paralel
    const [newsData, sameDayData] = await Promise.all([
      Promise.resolve(news), // news este deja disponibil
      fetchNewsByDate(news.publicationDate, id, 5)
    ]);
    news = newsData;
    sameDayNews = sameDayData;
  }

  const publicationDate = new Date(news.publicationDate);
  const formattedDate = publicationDate.toLocaleDateString('ro-RO', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  const citationFields = getCitationFields(news.content, news.filename);
  const summary = extractField<string>(news.content, 'summary');
  const body = extractField<string>(news.content, 'body');
  const author = extractField<string>(news.content, 'author');
  const category = extractField<string>(news.content, 'category');
  const keywords = extractField<string[]>(news.content, 'keywords');
  const tables = extractField<any[]>(news.content, 'tables') || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SessionCookieInitializer />
      {/* NavigationEndBeacon va reseta loader-ul imediat când pagina se montează */}
      <NavigationEndBeacon />
      
      {/* Schema.org structured data */}
              <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "headline": news.title,
              "description": summary || news.title,
              "image": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/logo_with_bg.png`,
                "width": 1200,
                "height": 630,
                "alt": `Logo Decodorul Oficial - ${news.title}`
              },
              "datePublished": news.publicationDate,
              "dateModified": news.updatedAt || news.publicationDate,
              "author": {
                "@type": "Organization",
                "name": author || "Decodorul Oficial",
                "url": process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Decodorul Oficial",
                "url": process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/logo_with_bg.png`,
                  "width": 512,
                  "height": 512
                },
                "foundingDate": "2024",
                "areaServed": {
                  "@type": "Country",
                  "name": "Romania"
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/stiri/${createNewsSlug(news.title, news.id)}`
              },
              "articleSection": category || "Legislație",
              "keywords": keywords ? keywords.join(", ") : "legislație română, acte normative, Monitorul Oficial",
              "inLanguage": "ro",
              "isAccessibleForFree": true,
              "wordCount": summary ? summary.split(' ').length : 0,
              "articleBody": summary || news.title,
              "genre": "legal information",
              "audience": {
                "@type": "Audience",
                "audienceType": "Legal professionals, businesses, citizens"
              }
            })
          }}
        />

      <main className="container-responsive flex-1 py-8" role="main">
        {/* Floating Share Sidebar for Desktop */}
        <FloatingShareSidebar
          url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro'}/stiri/${createNewsSlug(news.title, news.id)}`}
          title={news.title}
          description={summary || news.title}
        />
        
        {/* Breadcrumb: desktop shows full, mobile shows "Înapoi la listă" */}
        <nav aria-label="Breadcrumb" className="mb-6">
          {/* Desktop breadcrumb */}
          <ol className="hidden sm:flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-brand-info hover:underline">
                Acasă
              </Link>
            </li>
            {/*<li className="text-gray-400">/</li>
            <li>
              <Link href="/stiri" className="text-brand-info hover:underline">
                Știri
              </Link>
            </li>*/}
            <li className="text-gray-400">/</li>
            <li className="text-gray-600" aria-current="page">
              {news.title}
            </li>
          </ol>
          {/* Mobile: show "Înapoi la listă" */}
          <div className="sm:hidden">
            <Link href="/" className="text-brand-info hover:underline flex items-center gap-1">
              <span aria-hidden="true">←</span> Înapoi la Știri
            </Link>
          </div>
        </nav>

        <article className="space-y-6" itemScope itemType="https://schema.org/NewsArticle">
          {/* Track news view */}
          <NewsViewTrackingWrapper news={news} />
          
          <header className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900" itemProp="headline">{news.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <time dateTime={news.publicationDate} itemProp="datePublished">
                <span className="font-medium">Data publicării:</span> {formattedDate}
              </time>
              
              {author && (
                <span itemProp="author" itemScope itemType="https://schema.org/Person">
                  <span className="font-medium">Autor:</span> <span itemProp="name">{author}</span>
                </span>
              )}
              
              {category && (
                <span>
                  <span className="font-medium">Categoria:</span> {category}
                </span>
              )}
            </div>

            {Array.isArray(keywords) && keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Cuvinte cheie:</span>
                {keywords.map((keyword) => (
                  <Link
                    key={keyword}
                    href={`/stiri?keywords=${encodeURIComponent(keyword)}`}
                    className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    {keyword}
                  </Link>
                ))}
              </div>
            )}

            {/* Share buttons after title and metadata */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <span className="hidden sm:inline">Distribuie această știre:</span>
                <span className="sm:hidden">Distribuie:</span>
              </div>
              <ShareButtons
                url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro'}/stiri/${createNewsSlug(news.title, news.id)}`}
                title={news.title}
                description={summary || news.title}
                variant="horizontal"
                showLabels={false}
                className="flex-shrink-0"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-60 rounded-md bg-gradient-to-br from-brand to-brand-highlight">
                <div className="flex items-center justify-center h-full">
                  <Rss className="h-16 w-16 text-white" />
                </div>
              </div>
              
              <section className="article-content prose prose-lg max-w-none" itemProp="articleBody">
                {summary && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">Sinteză</h2>
                    <p className="text-blue-800" itemProp="description">{summary}</p>
                  </div>
                )}
                
                {body && (
                  <div dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }} />
                )}
                
                {typeof news.content === 'string' && <p>{news.content}</p>}
              </section>
              
              <div className="space-y-3">
                <Citation {...citationFields} />
                {/* Minimal newsletter CTA below full article */}
                <NewsletterCtaInline />
                
                {/* Share section at the end of the article */}
                <ArticleShareSection
                  url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro'}/stiri/${createNewsSlug(news.title, news.id)}`}
                  title={news.title}
                  description={summary || news.title}
                />
              </div>
            </div>
            
            <aside className="space-y-6" role="complementary">
              {/* Statistics section */}
              <NewsViewStats news={news} />
              
              {/* Share buttons for mobile users - HIDDEN */}
              {/* <div className="lg:hidden">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Distribuie această știre
                  </h3>
                  <ShareButtons
                    url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro'}/stiri/${createNewsSlug(news.title, news.id)}`}
                    title={news.title}
                    description={summary || news.title}
                    variant="horizontal"
                    showLabels={true}
                    className="justify-start"
                  />
                </div>
              </div> */}
              
              {/* Secțiunea cu știrile din aceeași zi */}
              {sameDayNews.length > 0 && (
                <div className="mt-12">
                  <SameDayNewsSection news={sameDayNews} currentNewsId={id} />
                </div>
              )}
            </aside>
          </div>

          {Array.isArray(tables) && tables.length > 0 && (
            <section className="mt-8">
              <TablesRenderer tables={tables} />
            </section>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}

// removed inline client component; replaced with dedicated client component NewsletterCtaInline
