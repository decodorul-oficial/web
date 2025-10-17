export type NewsItem = {
  id: string;
  title: string;
  publicationDate: string;
  createdAt?: string;
  updatedAt?: string;
  filename?: string;
  // Field returned as JSON from the API. Structure can vary per source.
  content: unknown;
  // New field for view count
  viewCount?: number;
  category?: string;
  // Optional favorite flag, populated only for eligible users
  isFavorite?: boolean;
};

export type GetStiriResponse = {
  getStiri: {
    stiri: NewsItem[];
    pagination: {
      totalCount: number;
      currentPage: number;
      totalPages: number;
    };
  };
};

// Updated types for most read news (no pagination needed)
export type MostReadStiriResponse = {
  getMostReadStiri: {
    stiri: NewsItem[];
  };
};

// Updated params for most read news
export type MostReadStiriParams = {
  period?: string;
  limit?: number;
};

// New types for keyword search
export type SearchStiriByKeywordsResponse = {
  searchStiriByKeywords: {
    stiri: NewsItem[];
    pagination: {
      totalCount: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type SearchStiriByKeywordsParams = {
  query?: string; // Fuzzy/full-text search parameter
  keywords?: string[]; // Exact keyword filtering from content.keywords
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  publicationDateFrom?: string;
  publicationDateTo?: string;
};

// Types for daily synthesis
export type DailySynthesis = {
  id: string;
  synthesisDate: string;
  title: string;
  content: string; // HTML content
  summary: string;
  metadata: {
    hashtags?: string[];
    character_count?: number;
  };
};

export type GetDailySynthesisResponse = {
  getDailySynthesis: DailySynthesis | null;
};

export type GetDailySynthesisParams = {
  date: string; // Format: YYYY-MM-DD
};

// Types for categories
export type CategoryCount = {
  name: string;
  slug: string;
  count: number;
};

export type GetCategoriesResponse = {
  getCategories: CategoryCount[];
};

// Types for category listing
export type GetStiriByCategoryResponse = {
  getStiriByCategory: {
    stiri: NewsItem[];
    pagination: {
      totalCount: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

// Types for relevance reasons, which comes as JSON
export type RelevanceReasons = {
  common_legal_acts?: string[];
  common_organizations?: string[];
  common_topics?: string[];
  common_keywords?: string[];
  same_category?: boolean;
};

// A related story includes full NewsItem details plus relevance data
export type RelatedStory = NewsItem & {
  relevanceScore: number;
  relevanceReasons: RelevanceReasons;
};

// The response from the GraphQL query for related stories
export type GetRelatedStoriesResponse = {
  getRelatedStories: {
    relatedStories: RelatedStory[];
  };
};

export type GetRelatedStoriesParams = {
  storyId: string;
  limit?: number;
  minScore?: number;
};

// Types for personalized feed
export type PersonalizedNewsItem = NewsItem & {
  category?: string;
};

export type GetPersonalizedFeedResponse = {
  getPersonalizedFeed: {
    stiri: PersonalizedNewsItem[];
    pagination: {
      totalCount: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type GetPersonalizedFeedParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
};


// Types for Document Connections feature
export type DocumentConnectionView = {
  idConexiune: string;
  idStireSursa: string;
  cheieDocumentSursa?: string | null;
  idStireTinta?: string | null;
  cheieDocumentTinta?: string | null;
  tipRelatie: string;
  confidenceScore?: number | null;
  extractionMethod?: string | null;
};

export type GetDocumentConnectionsByNewsResponse = {
  getDocumentConnectionsByNews: DocumentConnectionView[];
};

export type GetDocumentConnectionsByNewsParams = {
  newsId: string;
  relationType?: string;
  limit?: number;
  offset?: number;
};

