import { Metadata } from 'next';
import { fetchLatestNews } from '@/features/news/services/newsService';
import { createNewsSlug } from '@/lib/utils/slugify';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

export const metadata: Metadata = {
  title: 'Arhivă Știri Legislative | Decodorul Oficial',
  description: 'Arhivă completă a știrilor legislative din Monitorul Oficial al României. Caută și navighează prin toate articolele publicate, organizate cronologic.',
  keywords: [
    'arhivă știri legislative',
    'Monitorul Oficial arhivă',
    'legislație română arhivă',
    'acte normative arhivă',
    'hotărâri de guvern arhivă',
    'ordine ministeriale arhivă'
  ],
  openGraph: {
    title: 'Arhivă Știri Legislative | Decodorul Oficial',
    description: 'Arhivă completă a știrilor legislative din Monitorul Oficial al României.',
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

interface NewsGroup {
  date: string;
  formattedDate: string;
  news: Array<{
    id: string;
    title: string;
    slug: string;
    publicationDate: string;
    summary?: string;
  }>;
}

export default async function ArhivaPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro';
  
  // Schema.org structured data for archive page
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Arhivă Știri Legislative | Decodorul Oficial",
    "description": "Arhivă completă a știrilor legislative din Monitorul Oficial al României",
    "url": `${baseUrl}/arhiva`,
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
        }
      ]
    },
    "inLanguage": "ro",
    "isAccessibleForFree": true,
    "genre": "legal information"
  };

  try {
    // Fetch all news with a reasonable limit to get comprehensive archive
    const { stiri } = await fetchLatestNews({ 
      limit: 100, 
      orderBy: 'publicationDate', 
      orderDirection: 'desc' 
    });

    // Group news by date
    const newsByDate = stiri.reduce((groups: { [key: string]: NewsGroup }, news) => {
      const date = new Date(news.publicationDate).toISOString().split('T')[0];
      const formattedDate = new Date(news.publicationDate).toLocaleDateString('ro-RO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[date]) {
        groups[date] = {
          date,
          formattedDate,
          news: []
        };
      }

      groups[date].news.push({
        id: news.id,
        title: news.title,
        slug: createNewsSlug(news.title, news.id),
        publicationDate: news.publicationDate,
        summary: (news.content as any)?.body || (news.content as any)?.summary || (news.content as any)?.text
      });

      return groups;
    }, {});

    // Convert to array and sort by date (newest first)
    const sortedGroups = Object.values(newsByDate).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

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
              href="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la pagina principală
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Arhivă Știri Legislative
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Arhivă completă a știrilor legislative din Monitorul Oficial al României. 
              Navighează prin toate articolele publicate, organizate cronologic.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {stiri.length} știri legislative
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Toate articolele sunt organizate cronologic, de la cele mai recente la cele mai vechi.
                  </p>
                </div>
              </div>
            </div>

            {/* Year Archives Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Arhive pe ani</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 6 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  const yearNews = stiri.filter(news => {
                    const newsYear = new Date(news.publicationDate).getFullYear();
                    return newsYear === year;
                  });
                  
                  if (yearNews.length === 0) return null;
                  
                  return (
                    <Link 
                      key={year}
                      href={`/arhiva/${year}`}
                      className="block group"
                    >
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 transition-colors mb-2">
                          {year}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {yearNews.length} {yearNews.length === 1 ? 'articol' : 'articole'}
                        </p>
                      </div>
                    </Link>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          </div>

          {/* News Archive */}
          <div className="space-y-8">
            {sortedGroups.map((group) => (
              <div key={group.date} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                    {group.formattedDate}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {group.news.length} {group.news.length === 1 ? 'articol' : 'articole'}
                  </p>
                </div>

                <div className="divide-y divide-gray-100">
                  {group.news.map((news) => (
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

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>
              Arhivă actualizată automat cu toate știrile legislative din Monitorul Oficial al României.
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error loading archive:', error);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Eroare la încărcarea arhivei
          </h1>
          <p className="text-gray-600 mb-6">
            Nu s-a putut încărca arhiva de știri. Vă rugăm să încercați din nou.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la pagina principală
          </Link>
        </div>
      </div>
    );
  }
}
