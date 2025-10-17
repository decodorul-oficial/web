import { gql } from 'graphql-request';

// Query pentru obținerea căutărilor salvate
export const GET_SAVED_SEARCHES = gql`
  query GetSavedSearches(
    $limit: Int
    $offset: Int
    $orderBy: String
    $orderDirection: String
    $favoritesOnly: Boolean
  ) {
    getSavedSearches(
      limit: $limit
      offset: $offset
      orderBy: $orderBy
      orderDirection: $orderDirection
      favoritesOnly: $favoritesOnly
    ) {
      savedSearches {
        id
        name
        description
        searchParams
        isFavorite
        emailNotificationsEnabled
        createdAt
        updatedAt
      }
      pagination {
        totalCount
        hasNextPage
        currentPage
        totalPages
      }
    }
  }
`;

// Query pentru obținerea unei căutări salvate specifice
export const GET_SAVED_SEARCH_BY_ID = gql`
  query GetSavedSearchById($id: ID!) {
    getSavedSearchById(id: $id) {
      id
      name
      description
      searchParams
      isFavorite
      emailNotificationsEnabled
      createdAt
      updatedAt
    }
  }
`;

// Mutation pentru salvarea unei căutări
export const SAVE_SEARCH = gql`
  mutation SaveSearch($input: SaveSearchInput!) {
    saveSearch(input: $input) {
      id
      name
      description
      searchParams
      isFavorite
      createdAt
    }
  }
`;

// Mutation pentru actualizarea unei căutări salvate
export const UPDATE_SAVED_SEARCH = gql`
  mutation UpdateSavedSearch($id: ID!, $input: UpdateSavedSearchInput!) {
    updateSavedSearch(id: $id, input: $input) {
      id
      name
      description
      searchParams
      isFavorite
      updatedAt
    }
  }
`;

// Mutation pentru ștergerea unei căutări salvate
export const DELETE_SAVED_SEARCH = gql`
  mutation DeleteSavedSearch($id: ID!) {
    deleteSavedSearch(id: $id)
  }
`;

// Mutation pentru comutarea statusului de favorit
export const TOGGLE_FAVORITE_SEARCH = gql`
  mutation ToggleFavoriteSearch($id: ID!) {
    toggleFavoriteSearch(id: $id) {
      id
      name
      isFavorite
    }
  }
`;

// Query pentru obținerea informațiilor despre notificările email
export const GET_EMAIL_NOTIFICATION_INFO = gql`
  query GetEmailNotificationInfo {
    getEmailNotificationInfo {
      currentCount
      limit
      canEnableMore
    }
  }
`;

// Mutation pentru comutarea notificărilor email
export const TOGGLE_EMAIL_NOTIFICATIONS = gql`
  mutation ToggleEmailNotifications($id: ID!, $enabled: Boolean!) {
    toggleEmailNotifications(id: $id, enabled: $enabled) {
      id
      name
      emailNotificationsEnabled
    }
  }
`;
