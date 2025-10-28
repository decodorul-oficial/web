import { getGraphQLClient } from '@/lib/graphql/client';
import { requestWithEndpointFallback } from '@/lib/graphql/utils';
import { UserService } from '@/features/user/services/userService'; // Import direct
import {
  GET_STIRI,
  GET_STIRE_BY_ID,
  GET_MOST_READ_STIRI,
  SEARCH_STIRI_BY_KEYWORDS,
  GET_DAILY_SYNTHESIS,
  GET_STIRI_BY_CATEGORY,
  GET_CATEGORIES,
  GET_STIRI_BY_CATEGORY_SLUG,
  GET_RELATED_STORIES,
  GET_PERSONALIZED_FEED
} from '../graphql/queries';
import {
  GetStiriResponse,
  NewsItem,
  MostReadStiriResponse,
  MostReadStiriParams,
  SearchStiriByKeywordsResponse,
  SearchStiriByKeywordsParams,
  GetDailySynthesisResponse,
  GetDailySynthesisParams,
  GetStiriByCategoryResponse,
  GetCategoriesResponse,
  CategoryCount,
  GetRelatedStoriesResponse,
  GetRelatedStoriesParams,
  RelatedStory,
  GetPersonalizedFeedResponse,
  GetPersonalizedFeedParams,
  GetDocumentConnectionsByNewsParams,
  GetDocumentConnectionsByNewsResponse,
  DocumentConnectionView
} from '../types';
import { ensureSessionCookie } from '@/lib/utils/sessionCookie';
import { GET_DOCUMENT_CONNECTIONS_BY_NEWS } from '../graphql/queries';

/**
 * Creează un client GraphQL care este automat autentificat
 * dacă un token este disponibil în UserService.
 */
const getApiClient = () => {
    const token = UserService.getAuthToken();
    return getGraphQLClient({
        getAuthToken: () => token ?? undefined
    });
};

export type FetchNewsParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
};

export async function fetchLatestNews(params: FetchNewsParams = {}) {
  const { limit = 10, offset = 0, orderBy = 'publicationDate', orderDirection = 'desc' } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));
  ensureSessionCookie();

  try {
    const client = getApiClient(); // Folosește clientul standard (poate fi autentificat sau nu)
    const data = await client.request<GetStiriResponse>(GET_STIRI, {
      limit: limitClamped,
      offset,
      orderBy,
      orderDirection
    });
    return data.getStiri;
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return {
      stiri: [],
      pagination: { totalCount: 0, currentPage: 1, totalPages: 1 }
    };
  }
}

export async function fetchNewsById(id: string): Promise<NewsItem | null> {
  ensureSessionCookie();

  try {
    const client = getApiClient();
    const data = await client.request<{ getStireById?: NewsItem }>(GET_STIRE_BY_ID, { id });
    return data?.getStireById ?? null;
  } catch (error) {
    console.error(`Error fetching news by id ${id}:`, error);
    return null;
  }
}

export async function fetchNewsByDate(date: string, excludeId?: string, limit: number = 5): Promise<NewsItem[]> {
  ensureSessionCookie();
  
  try {
    const needsExtra = excludeId ? 1 : 0;
    const { stiri } = await searchStiriByKeywords({
      keywords: [],
      limit: limit + needsExtra,
      offset: 0,
      orderBy: 'publicationDate',
      orderDirection: 'desc',
      publicationDateFrom: date,
      publicationDateTo: date
    });

    const filtered = excludeId ? stiri.filter((s) => s.id !== excludeId) : stiri;
    return filtered.slice(0, limit);
  } catch (error) {
    console.error('fetchNewsByDate failed', error);
    return [];
  }
}

export async function fetchMostReadStiri(params: MostReadStiriParams = {}) {
    const { limit = 10, period = '7d' } = params;
    const limitClamped = Math.max(1, Math.min(100, limit));
    ensureSessionCookie();

    try {
        const client = getApiClient();
        const data = await client.request<MostReadStiriResponse>(GET_MOST_READ_STIRI, {
            limit: limitClamped,
            period
        });
        return data.getMostReadStiri;
    } catch (error) {
        console.error('Error fetching most read news:', error);
        return { stiri: [] };
    }
}

export async function searchStiriByKeywords(params: SearchStiriByKeywordsParams) {
  const { query, keywords, limit = 20, offset = 0, orderBy = 'publicationDate', orderDirection = 'desc', publicationDateFrom, publicationDateTo } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));
  ensureSessionCookie();

  try {
    const client = getApiClient(); // Clientul este acum conștient de starea de autentificare
    const data = await client.request<SearchStiriByKeywordsResponse>(SEARCH_STIRI_BY_KEYWORDS, {
      query,
      keywords,
      limit: limitClamped,
      offset,
      orderBy,
      orderDirection,
      publicationDateFrom,
      publicationDateTo
    });
    return data.searchStiriByKeywords;
  } catch (error) {
    console.error('searchStiriByKeywords failed:', error);
    return {
      stiri: [],
      pagination: { totalCount: 0, currentPage: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
    };
  }
}

export async function fetchPersonalizedFeed(params: GetPersonalizedFeedParams = {}) {
  const {
    limit = 10,
    offset = 0,
    orderBy = 'publicationDate',
    orderDirection = 'desc'
  } = params;

  const limitClamped = Math.max(1, Math.min(100, limit));
  ensureSessionCookie();

  try {
    // Clientul este acum direct autentificat dacă token-ul există în UserService
    const client = getApiClient();

    const data = await client.request<GetPersonalizedFeedResponse>(GET_PERSONALIZED_FEED, {
      limit: limitClamped,
      offset,
      orderBy,
      orderDirection
    });

    return data.getPersonalizedFeed;
  } catch (error) {
    console.error('Error fetching personalized feed:', error);
    // Aruncă eroarea mai departe pentru a fi gestionată de componentă
    throw error;
  }
}

export async function getDailySynthesis(params: GetDailySynthesisParams): Promise<GetDailySynthesisResponse> {
  try {
    const client = getApiClient();
    const response = await client.request<GetDailySynthesisResponse>(
      GET_DAILY_SYNTHESIS,
      params
    );
    return response;
  } catch (error) {
    console.error('Error fetching daily synthesis:', error);
    throw error;
  }
}

export async function fetchCategories(limit: number = 100): Promise<CategoryCount[]> {
  try {
    const client = getApiClient();
    const data = await client.request<GetCategoriesResponse>(GET_CATEGORIES, { limit });
    return data.getCategories;
  } catch (error) {
    console.error('fetchCategories failed:', error);
    return [];
  }
}

export async function fetchStiriByCategory(params: { category: string; limit?: number; offset?: number }): Promise<GetStiriByCategoryResponse['getStiriByCategory']> {
  const { category, limit = 20, offset = 0 } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));
  ensureSessionCookie();

  try {
    const client = getApiClient();
    const data = await client.request<GetStiriByCategoryResponse>(GET_STIRI_BY_CATEGORY, {
      category,
      limit: limitClamped,
      offset
    });
    return data.getStiriByCategory;
  } catch (error) {
    console.error('fetchStiriByCategory failed:', error);
    return {
      stiri: [],
      pagination: { totalCount: 0, currentPage: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
    };
  }
}

export async function fetchStiriByCategorySlug(params: { slug: string; limit?: number; offset?: number }): Promise<GetStiriByCategoryResponse['getStiriByCategory']> {
  const { slug, limit = 20, offset = 0 } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));
  ensureSessionCookie();

  try {
    const client = getApiClient();
    const data = await client.request<GetStiriByCategoryResponse>(GET_STIRI_BY_CATEGORY_SLUG, {
      slug,
      limit: limitClamped,
      offset
    });
    return (data as unknown as { getStiriByCategorySlug: GetStiriByCategoryResponse['getStiriByCategory'] }).getStiriByCategorySlug;
  } catch (error) {
    console.error('fetchStiriByCategorySlug failed:', error);
    return {
      stiri: [],
      pagination: { totalCount: 0, currentPage: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
    };
  }
}

export async function fetchRelatedStories(params: GetRelatedStoriesParams): Promise<RelatedStory[]> {
  const { storyId, limit = 5, minScore = 1.0 } = params;
  const limitClamped = Math.max(1, Math.min(20, limit));
  ensureSessionCookie();

  try {
    const client = getApiClient();
    const data = await client.request<GetRelatedStoriesResponse>(GET_RELATED_STORIES, {
      storyId,
      limit: limitClamped,
      minScore
    });
    return data.getRelatedStories.relatedStories;
  } catch (error) {
    console.error('Error fetching related stories:', error);
    return [];
  }
}

/**
 * Fetch document connections for a specific news item (authenticated, premium/trial required)
 */
export async function fetchDocumentConnectionsByNews(params: GetDocumentConnectionsByNewsParams): Promise<DocumentConnectionView[]> {
  const { newsId, relationType, limit = 20, offset = 0 } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));
  ensureSessionCookie();

  try {
    const client = getApiClient();
    const data = await client.request<GetDocumentConnectionsByNewsResponse>(
      GET_DOCUMENT_CONNECTIONS_BY_NEWS,
      {
        newsId,
        relationType: relationType ?? null,
        limit: limitClamped,
        offset
      }
    );
    return data.getDocumentConnectionsByNews || [];
  } catch (error) {
    console.error('Error fetching document connections by news:', error);
    // If unauthorized or subscription required, return empty; UI will handle gating
    return [];
  }
}

