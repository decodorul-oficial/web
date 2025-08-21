import Link from 'next/link';
import { NewsItem } from '../types';
import { createNewsSlug } from '@/lib/utils/slugify';
import { Eye } from 'lucide-react';

interface SameDayNewsSectionProps {
  news: NewsItem[];
  currentNewsId: string;
}

export function SameDayNewsSection({ news, currentNewsId }: SameDayNewsSectionProps) {
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

  // Get the date from the first news item for the section title
  const currentDate = news[0]?.publicationDate || '';

  return (
    <div className="space-y-4 same-day-news">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Știri din aceeași zi ({formatDate(currentDate)})
      </h3>
      <div className="space-y-3">
        {news.map((stire) => (
          <article key={stire.id} className="rounded border border-gray-200 p-3 hover:border-gray-300 transition-colors">
            <Link href={`/stiri/${createNewsSlug(stire.title, stire.id)}`} className="block space-y-2">
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
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-400" />
                  {stire.viewCount ?? 0}
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
