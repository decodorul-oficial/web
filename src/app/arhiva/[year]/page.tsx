import { Metadata } from 'next';
import { fetchLatestNews } from '@/features/news/services/newsService';
import Link from 'next/link';
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

interface GenerateMetadataProps {
  params: { year: string };
}

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const year = params.year;
  
  return {
    title: `Arhivă ${year} | Decodorul Oficial`,
    description: `Arhivă completă a știrilor legislative din ${year} din Monitorul Oficial al României. Navighează prin toate lunile din ${year}.`,
    keywords: [
      `arhivă ${year}`,
      `știri legislative ${year}`,
      `Monitorul Oficial ${year}`,
      `legislație română ${year}`,
      `acte normative ${year}`
    ],
    openGraph: {
      title: `Arhivă ${year} | Decodorul Oficial`,
      description: `Arhivă completă a știrilor legislative din ${year} din Monitorul Oficial al României.`,
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

interface MonthData {
  month: string;
  monthName: string;
  year: string;
  articleCount: number;
  firstArticleDate?: string;
  lastArticleDate?: string;
}

export default async function YearArchivePage({ params }: { params: { year: string } }) {
  const year = params.year;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro';
  
  // Schema.org structured data for year archive page
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Arhivă ${year} | Decodorul Oficial`,
    "description": `Arhivă completă a știrilor legislative din ${year} din Monitorul Oficial al României`,
    "url": `${baseUrl}/arhiva/${year}`,
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
        }
      ]
    },
    "inLanguage": "ro",
    "isAccessibleForFree": true,
    "genre": "legal information"
  };

  try {
    // Fetch all news to analyze by year
    const { stiri } = await fetchLatestNews({ 
      limit: 100, 
      orderBy: 'publicationDate', 
      orderDirection: 'desc' 
    });

    // Filter news for the specific year
    const yearNews = stiri.filter(news => {
      const newsYear = new Date(news.publicationDate).getFullYear().toString();
      return newsYear === year;
    });

    // Group by month
    const monthsData: { [key: string]: MonthData } = {};
    
    yearNews.forEach(news => {
      const date = new Date(news.publicationDate);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthName = date.toLocaleDateString('ro-RO', { month: 'long' });
      
      if (!monthsData[month]) {
        monthsData[month] = {
          month,
          monthName,
          year,
          articleCount: 0,
          firstArticleDate: news.publicationDate,
          lastArticleDate: news.publicationDate
        };
      }
      
      monthsData[month].articleCount++;
      
      // Update first and last article dates
      if (news.publicationDate < monthsData[month].firstArticleDate!) {
        monthsData[month].firstArticleDate = news.publicationDate;
      }
      if (news.publicationDate > monthsData[month].lastArticleDate!) {
        monthsData[month].lastArticleDate = news.publicationDate;
      }
    });

    // Convert to array and sort by month
    const sortedMonths = Object.values(monthsData).sort((a, b) => b.month.localeCompare(a.month));

    // Calculate navigation years
    const currentYear = parseInt(year);
    const prevYear = currentYear - 1;
    const nextYear = currentYear + 1;
    const currentDate = new Date();
    const maxYear = currentDate.getFullYear();

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
              href="/arhiva" 
              className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la arhiva completă
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Arhivă {year}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Arhivă completă a știrilor legislative din {year} din Monitorul Oficial al României. 
              Navighează prin toate lunile din {year}.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {yearNews.length} știri legislative în {year}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Organizate pe {sortedMonths.length} luni, de la cele mai recente la cele mai vechi.
                  </p>
                </div>
              </div>
            </div>

            {/* Year Navigation */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                {prevYear >= 2020 && (
                  <Link 
                    href={`/arhiva/${prevYear}`}
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {prevYear}
                  </Link>
                )}
              </div>
              
              <div className="text-lg font-semibold text-gray-900">
                {year}
              </div>
              
              <div className="flex items-center space-x-4">
                {nextYear <= maxYear && (
                  <Link 
                    href={`/arhiva/${nextYear}`}
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {nextYear}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Months Grid */}
          {sortedMonths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMonths.map((monthData) => (
                <Link 
                  key={monthData.month}
                  href={`/arhiva/${year}/${monthData.month}`}
                  className="block group"
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {monthData.monthName}
                      </h2>
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{monthData.articleCount}</span> {monthData.articleCount === 1 ? 'articol' : 'articole'}
                      </p>
                      
                      {monthData.firstArticleDate && monthData.lastArticleDate && (
                        <p className="text-xs text-gray-500">
                          {new Date(monthData.firstArticleDate).toLocaleDateString('ro-RO', {
                            day: '2-digit',
                            month: '2-digit'
                          })} - {new Date(monthData.lastArticleDate).toLocaleDateString('ro-RO', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nu există știri pentru {year}
              </h3>
              <p className="text-gray-600">
                Nu s-au găsit știri legislative din anul {year}.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>
              Arhivă organizată cronologic pentru navigare ușoară prin conținutul din {year}.
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error loading year archive:', error);
    
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container-responsive flex-1 py-6" role="main">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Eroare la încărcarea arhivei pentru {year}
            </h1>
            <p className="text-gray-600 mb-6">
              Nu s-a putut încărca arhiva pentru anul {year}. Vă rugăm să încercați din nou.
            </p>
            <Link 
              href="/arhiva" 
              className="inline-flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la arhiva completă
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}
