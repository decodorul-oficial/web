import { gql } from '@apollo/client';

// Types
export interface FavoriteNews {
  id: string;
  userId: string;
  newsId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  publicationDate: string;
  viewCount: number;
  summary: string;
}

export interface PaginationInfo {
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

export interface FavoriteNewsResponse {
  favoriteNews: FavoriteNews[];
  pagination: PaginationInfo;
}

export interface ToggleFavoriteNewsResponse {
  action: string;
  isFavorite: boolean;
  message: string;
  favoriteNews: FavoriteNews | null;
}

export interface FavoriteNewsStats {
  totalFavorites: number;
  latestFavoriteDate: string | null;
}

// Queries
export const GET_FAVORITE_NEWS = gql`
  query GetFavoriteNews($limit: Int, $offset: Int, $orderBy: String, $orderDirection: String) {
    getFavoriteNews(limit: $limit, offset: $offset, orderBy: $orderBy, orderDirection: $orderDirection) {
      favoriteNews {
        id
        userId
        newsId
        createdAt
        updatedAt
        title
        publicationDate
        viewCount
        summary
      }
      pagination {
        totalCount
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
      }
    }
  }
`;

export const IS_FAVORITE_NEWS = gql`
  query IsFavoriteNews($newsId: String!) {
    isFavoriteNews(newsId: $newsId)
  }
`;

export const GET_FAVORITE_NEWS_STATS = gql`
  query GetFavoriteNewsStats {
    getFavoriteNewsStats {
      totalFavorites
      latestFavoriteDate
    }
  }
`;

// Mutations
export const ADD_FAVORITE_NEWS = gql`
  mutation AddFavoriteNews($newsId: String!) {
    addFavoriteNews(newsId: $newsId) {
      id
      userId
      newsId
      createdAt
    }
  }
`;

export const REMOVE_FAVORITE_NEWS = gql`
  mutation RemoveFavoriteNews($newsId: String!) {
    removeFavoriteNews(newsId: $newsId)
  }
`;

export const TOGGLE_FAVORITE_NEWS = gql`
  mutation ToggleFavoriteNews($newsId: String!) {
    toggleFavoriteNews(newsId: $newsId) {
      action
      isFavorite
      message
      favoriteNews {
        id
        newsId
        createdAt
      }
    }
  }
`;

export const CLEAR_ALL_FAVORITE_NEWS = gql`
  mutation ClearAllFavoriteNews {
    clearAllFavoriteNews
  }
`;
