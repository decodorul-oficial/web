export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  searchParams: SearchParams;
  isFavorite: boolean;
  emailNotificationsEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  query?: string;
  keywords?: string[];
  publicationDateFrom?: string;
  publicationDateTo?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface SavedSearchResponse {
  savedSearches: SavedSearch[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  totalCount: number;
  hasNextPage: boolean;
  currentPage: number;
  totalPages: number;
}

export interface SaveSearchInput {
  name: string;
  description?: string;
  searchParams: SearchParams;
  isFavorite?: boolean;
}

export interface UpdateSavedSearchInput {
  name?: string;
  description?: string;
  searchParams?: SearchParams;
  isFavorite?: boolean;
}

export interface GetSavedSearchesParams {
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'name';
  orderDirection?: 'asc' | 'desc';
  favoritesOnly?: boolean;
}

export interface EmailNotificationInfo {
  currentCount: number;
  limit: number;
  canEnableMore: boolean;
}

export interface ToggleEmailNotificationInput {
  id: string;
  enabled: boolean;
}
