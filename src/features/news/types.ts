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


