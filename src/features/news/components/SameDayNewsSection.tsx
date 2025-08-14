import Link from 'next/link';
import { NewsItem } from '../types';

interface SameDayNewsSectionProps {
  news: NewsItem[];
  currentDate: string;
}

export function SameDayNewsSection({ news, currentDate }: SameDayNewsSectionProps) {
  if (news.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const extractSummary = (content: unknown): string => {
    if (!content || typeof content !== 'object') return '';
    const c = content as any;
    
    // Încercăm să găsim un sumar din conținut
    if (c.summary) return c.summary;
    if (c.body) {
      // Dacă avem body, luăm primele 150 de caractere
      const bodyText = typeof c.body === 'string' ? c.body : JSON.stringify(c.body);
      return bodyText.length > 150 ? bodyText.substring(0, 150) + '...' : bodyText;
    }
    
    // Fallback la titlu dacă nu avem altceva
    return '';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Știri din aceeași zi ({formatDate(currentDate)})
      </h3>
      <div className="space-y-3">
        {news.map((stire) => (
          <article key={stire.id} className="rounded border border-gray-200 p-3 hover:border-gray-300 transition-colors">
            <Link href={`/stiri/${stire.id}`} className="block space-y-2">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-brand-info">
                {stire.title}
              </h4>
              {extractSummary(stire.content) && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {extractSummary(stire.content)}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(stire.publicationDate)}</span>
                <span>{formatTime(stire.publicationDate)}</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
