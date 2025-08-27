import { Metadata } from 'next';
import { fetchLatestNews } from '@/features/news/services/newsService';
import { createNewsSlug } from '@/lib/utils/slugify';
import Link from 'next/link';
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

interface GenerateMetadataProps {
  params: { year: string; month: string };
}

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const { year, month } = params;
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('ro-RO', { month: 'long' });
  
  return {
    title: `Arhivă ${monthName} ${year} | Decodorul Oficial`,
    description: `Arhivă completă a știrilor legislative din ${monthName} ${year} din Monitorul Oficial al României.`,
    keywords: [
      `arhivă ${monthName} ${year}`,
      `știri legislative ${monthName} ${year}`,
      `Monitorul Oficial ${monthName} ${year}`,
      `legislație română ${monthName} ${year}`,
      `acte normative ${monthName} ${year}`
    ],
    openGraph: {
      title: `Arhivă ${monthName} ${year} | Decodorul Oficial`,
      description: `Arhivă completă a știrilor legislative din ${monthName} ${year} din Monitorul Oficial al României.`,
      type: 'website',
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
  };
}

export default async function MonthArchivePage({ params }: { params: { year: string; month: string } }) {
  const { year, month } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro';
  
  // Get month name
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('ro-RO', { month: 'long' });
  
  // Schema.org structured data for month archive page
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Arhivă ${monthName} ${year} | Decodorul Oficial`,
    "description": `Arhivă completă a știrilor legislative din ${monthName} ${year} din Monitorul Oficial al României`,
    "url": `${baseUrl}/arhiva/${year}/${month}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Acasă",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Arhivă",
          "item": `${baseUrl}/arhiva`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": year,
          "item": `${baseUrl}/arhiva/${year}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": monthName,
          "item": `${baseUrl}/arhiva/${year}/${month}`
        }
      ]
    },
    "inLanguage": "ro",
    "isAccessibleForFree": true,
    "genre": "legal information"
  };

  try {
    // Fetch all news to filter by month
    const { stiri } = await fetchLatestNews({ 
      limit: 100, 
      orderBy: 'publicationDate', 
      orderDirection: 'desc' 
    });

    // Filter news for the specific month and year
    const monthNews = stiri.filter(news => {
      const date = new Date(news.publicationDate);
      const newsYear = date.getFullYear().toString();
      const newsMonth = (date.getMonth() + 1).toString().padStart(2, '0');
      return newsYear === year && newsMonth === month;
    });

    // Group by day
    const newsByDay = monthNews.reduce((groups: { [key: string]: any[] }, news) => {
      const date = new Date(news.publicationDate);
      const day = date.getDate().toString().padStart(2, '0');
      const dayKey = `${year}-${month}-${day}`;
      
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      
      groups[dayKey].push({
        id: news.id,
        title: news.title,
        slug: createNewsSlug(news.title, news.id),
        publicationDate: news.publicationDate,
        summary: (news.content as any)?.body || (news.content as any)?.summary || (news.content as any)?.text
      });
      
      return groups;
    }, {});

    // Convert to array and sort by date (newest first)
    const sortedDays = Object.entries(newsByDay)
      .map(([dayKey, news]) => ({
        dayKey,
        date: new Date(dayKey),
        formattedDate: new Date(dayKey).toLocaleDateString('ro-RO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        }),
        news
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    // Calculate navigation
    const currentDate = new Date(parseInt(year), parseInt(month) - 1);
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const currentDateNow = new Date();
    const isNextMonthInFuture = nextMonth > currentDateNow;

    return (
      <div className="flex min-h-screen flex-col">
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaData)
          }}
        />
        
        <Header />
        <SessionCookieInitializer />
        
        <main className="container-responsive flex-1 py-6" role="main">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/arhiva/${year}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la arhiva {year}
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Arhivă {monthName} {year}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Arhivă completă a știrilor legislative din {monthName} {year} din Monitorul Oficial al României.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {monthNews.length} știri legislative în {monthName} {year}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Organizate pe {sortedDays.length} zile, de la cele mai recente la cele mai vechi.
                  </p>
                </div>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Link 
                  href={`/arhiva/${prevMonth.getFullYear()}/${(prevMonth.getMonth() + 1).toString().padStart(2, '0')}`}
                  className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {prevMonth.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
                </Link>
              </div>
              
              <div className="text-lg font-semibold text-gray-900">
                {monthName} {year}
              </div>
              
              <div className="flex items-center space-x-4">
                {!isNextMonthInFuture && (
                  <Link 
                    href={`/arhiva/${nextMonth.getFullYear()}/${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}`}
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {nextMonth.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* News by Day */}
          {sortedDays.length > 0 ? (
            <div className="space-y-8">
              {sortedDays.map((dayData) => (
                <div key={dayData.dayKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                      {dayData.formattedDate}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {dayData.news.length} {dayData.news.length === 1 ? 'articol' : 'articole'}
                    </p>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {dayData.news.map((news) => (
                      <article key={news.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <Link 
                          href={`/stiri/${news.slug}`}
                          className="block group"
                        >
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 transition-colors mb-2">
                            {news.title}
                          </h3>
                          
                          {news.summary && (
                            <div 
                              className="text-gray-600 text-sm mb-3 line-clamp-2 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: news.summary.length > 200 
                                  ? `${news.summary.substring(0, 200)}...` 
                                  : news.summary
                              }}
                            />
                          )}
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(news.publicationDate).toLocaleDateString('ro-RO', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nu există știri pentru {monthName} {year}
              </h3>
              <p className="text-gray-600">
                Nu s-au găsit știri legislative din {monthName} {year}.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>
              Arhivă organizată cronologic pentru navigare ușoară prin conținutul din {monthName} {year}.
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error loading month archive:', error);
    
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container-responsive flex-1 py-6" role="main">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Eroare la încărcarea arhivei pentru {monthName} {year}
            </h1>
            <p className="text-gray-600 mb-6">
              Nu s-a putut încărca arhiva pentru {monthName} {year}. Vă rugăm să încercați din nou.
            </p>
            <Link 
              href={`/arhiva/${year}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la arhiva {year}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}
