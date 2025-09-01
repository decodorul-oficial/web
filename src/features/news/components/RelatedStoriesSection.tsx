'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, type FC } from 'react';
import { fetchRelatedStories } from '@/features/news/services/newsService';
import { Gavel, TrendingUp, Eye } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { createNewsSlug } from '@/lib/utils/slugify';
import { trackNewsClick } from '../../../lib/analytics';
import type { RelatedStory, NewsItem, RelevanceReasons } from '@/features/news/types';
import { stripHtml } from '@/lib/html/sanitize';
import { SameDayNewsSection } from './SameDayNewsSection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

// Tip pentru componenta de iconiță Lucide
type LucideIcon = FC<LucideProps>;

// Interfață pentru structura conținutului unei știri
interface NewsContent {
  body?: string;
  summary?: string;
  text?: string;
  act?: string;
  actName?: string;
  partea?: string;
  monitorulOficial?: string;
  moNumberDate?: string;
  sourceUrl?: string;
  url?: string;
  lucide_icon?: string;
  lucideIcon?: string;
}

interface RelatedStoriesSectionProps {
  storyId: string;
  limit?: number;
  minScore?: number;
  fallbackNews: NewsItem[];
  currentNewsId: string;
}

function parseContent(content: unknown): Partial<NewsContent> {
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch {
            return {};
        }
    }
    if (typeof content === 'object' && content !== null) {
        return content as Partial<NewsContent>;
    }
    return {};
}

const formatRelevanceReasons = (reasons: RelevanceReasons | null | undefined): React.ReactNode => {
  if (!reasons) return "N/A";

  const reasonEntries = Object.entries(reasons).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  });

  if (reasonEntries.length === 0) return "Niciun motiv specific.";

  return (
    <ul className="list-none p-0 m-0 space-y-1 text-left">
      {reasons.common_legal_acts && reasons.common_legal_acts.length > 0 && (
        <li><span className="font-semibold">Acte:</span> {reasons.common_legal_acts.join(', ')}</li>
      )}
      {reasons.common_organizations && reasons.common_organizations.length > 0 && (
        <li><span className="font-semibold">Org:</span> {reasons.common_organizations.join(', ')}</li>
      )}
      {reasons.common_topics && reasons.common_topics.length > 0 && (
        <li><span className="font-semibold">Teme:</span> {reasons.common_topics.join(', ')}</li>
      )}
      {reasons.common_keywords && reasons.common_keywords.length > 0 && (
        <li><span className="font-semibold">Cuvinte:</span> {reasons.common_keywords.join(', ')}</li>
      )}
      {reasons.same_category && (
        <li><span className="font-semibold">Bonus:</span> Aceeași categorie</li>
      )}
    </ul>
  );
};


export function RelatedStoriesSection({ storyId, limit = 5, minScore = 1.0, fallbackNews, currentNewsId }: RelatedStoriesSectionProps) {
  const [relatedStories, setRelatedStories] = useState<RelatedStory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRelatedStories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stories = await fetchRelatedStories({ storyId, limit, minScore });
      setRelatedStories(stories);
    } catch (err) {
      console.error('Error loading related stories:', err);
      setError('Nu s-au putut încărca știrile relevante.');
    } finally {
      setIsLoading(false);
    }
  }, [storyId, limit, minScore]);

  useEffect(() => {
    if (storyId) {
      void loadRelatedStories();
    }
  }, [storyId, loadRelatedStories]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ro-RO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  function toPascalCase(value: string): string {
    return value
      .split(/[\s-_]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }

  function getLucideIconForContent(content: unknown, fallback: LucideIcon): LucideIcon {
    const c = parseContent(content);
    const iconName = c.lucide_icon ?? c.lucideIcon;

    if (typeof iconName === 'string' && iconName.trim().length > 0) {
      const candidates = Array.from(
        new Set([
          iconName,
          toPascalCase(iconName),
          iconName.charAt(0).toUpperCase() + iconName.slice(1),
          iconName.replace(/[-_ ]+/g, ''),
        ])
      );
      for (const candidate of candidates) {
        const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[candidate];
        if (Icon) return Icon;
      }
    }
    return fallback;
  }

  const handleNewsClick = (news: RelatedStory, section: string): void => {
    trackNewsClick(news.id, news.title, section);
  };
  
  const extractSummary = (content: unknown): string => {
    const c = parseContent(content);
    if (c.summary) return stripHtml(String(c.summary));
    if (c.body) {
      const bodyText = typeof c.body === 'string' ? c.body : JSON.stringify(c.body);
      const strippedText = stripHtml(bodyText);
      return strippedText.length > 150 ? strippedText.substring(0, 150) + '...' : strippedText;
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Știri Relevante
        </h3>
        <div className="space-y-3">
          <div className="animate-pulse rounded border border-gray-200 p-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded bg-gray-200"></div>
              </div>
              <div className="flex-1 min-w-0 space-y-2 py-1">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-full mt-2"></div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="h-2 bg-gray-200 rounded w-1/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
     // Afișăm fallback-ul în caz de eroare la API-ul de știri relevante
     return <SameDayNewsSection news={fallbackNews} currentNewsId={currentNewsId} />;
  }
  
  if (relatedStories.length === 0) {
    // Afișăm fallback-ul dacă nu există știri relevante
    return <SameDayNewsSection news={fallbackNews} currentNewsId={currentNewsId} />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Știri Relevante
        </h3>
        <div className="space-y-3">
          {relatedStories.map((story) => {
            const Icon = getLucideIconForContent(story.content, Gavel);
            const summary = extractSummary(story.content);

            return (
              <article key={story.id} className="rounded border border-gray-200 p-3 hover:border-gray-300 transition-colors">
                <Link 
                  href={`/stiri/${createNewsSlug(story.title, story.id)}`} 
                  className="block group"
                  onClick={() => handleNewsClick(story, 'related_stories_sidebar')}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-center">
                      <div className="h-8 w-8 rounded bg-gradient-to-br from-brand-accent to-brand-info/60 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="mt-1 flex items-center justify-center gap-1 text-xs text-brand-accent cursor-pointer">
                            <TrendingUp className="h-3 w-3" />
                            {story.relevanceScore.toFixed(1)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {formatRelevanceReasons(story.relevanceReasons)}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-3 group-hover:text-brand-info">
                        {story.title}
                      </h4>
                      {summary && (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                     <span>{formatDate(story.publicationDate)}</span>
                     <span className="flex items-center gap-1">
                       <Eye className="h-4 w-4 text-gray-400" />
                       {story.viewCount ?? 0}
                     </span>
                       
                     {/* hasSameCategory && (
                        <span className="text-brand-accent font-semibold whitespace-nowrap">
                          # Aceeași categorie
                        </span>
                     )} */}
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
