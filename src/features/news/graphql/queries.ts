import { gql } from 'graphql-request';

// Optimizat pentru a fi mai rapid
export const GET_STIRI = gql`
  query GetStiri($limit: Int!, $offset: Int!, $orderBy: String!, $orderDirection: String!) {
    getStiri(limit: $limit, offset: $offset, orderBy: $orderBy, orderDirection: $orderDirection) {
      stiri {
        id
        title
        publicationDate
        content
        filename
        viewCount
        isFavorite
      }
      pagination {
        totalCount
        currentPage
        totalPages
      }
    }
  }
`;

// Optimizat pentru a fi mai rapid
export const GET_STIRE_BY_ID = gql`
  query GetStireById($id: ID!) {
    getStireById(id: $id) {
      id
      title
      publicationDate
      createdAt
      updatedAt
      content
      filename
      viewCount
    }
  }
`;

// Optimizat pentru a fi mai rapid
export const SEARCH_STIRI = gql`
  query SearchStiri($query: String!, $limit: Int, $offset: Int, $orderBy: String, $orderDirection: String) {
    searchStiri(
      query: $query
      limit: $limit
      offset: $offset
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      stiri {
        id
        title
        publicationDate
        content
        filename
        viewCount
      }
      pagination {
        totalCount
        currentPage
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Updated query for most read news to match API implementation
// Optimizat pentru a fi mai rapid
export const GET_MOST_READ_STIRI = gql`
  query GetMostReadStiri($period: String, $limit: Int) {
    getMostReadStiri(period: $period, limit: $limit) {
      stiri {
        id
        title
        publicationDate
        content
        filename
        viewCount
      }
    }
  }
`;

// Note: trackNewsView mutation is no longer needed as it's handled automatically
// by the getStireById query

// Enhanced query for searching news with fuzzy search, keywords, and date filters
export const SEARCH_STIRI_BY_KEYWORDS = gql`
  query SearchStiriByKeywords(
    $query: String
    $keywords: [String!]
    $limit: Int
    $offset: Int
    $orderBy: String
    $orderDirection: String
    $publicationDateFrom: String
    $publicationDateTo: String
  ) {
    searchStiriByKeywords(
      query: $query
      keywords: $keywords
      limit: $limit
      offset: $offset
      orderBy: $orderBy
      orderDirection: $orderDirection
      publicationDateFrom: $publicationDateFrom
      publicationDateTo: $publicationDateTo
    ) {
      stiri {
        id
        title
        publicationDate
        content
        filename
        viewCount
        isFavorite
      }
      pagination {
        totalCount
        currentPage
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Query for daily synthesis
export const GET_DAILY_SYNTHESIS = gql`
  query GetDailySynthesis($date: String!) {
    getDailySynthesis(date: $date) {
      id
      synthesisDate
      title
      content
      summary
      metadata
    }
  }
`;

// Query: getStiriByCategory
export const GET_STIRI_BY_CATEGORY = gql`
  query GetStiriByCategory($category: String!, $limit: Int, $offset: Int) {
    getStiriByCategory(
      category: $category
      limit: $limit
      offset: $offset
      orderBy: "publicationDate"
      orderDirection: "desc"
    ) {
      stiri {
        id
        title
        publicationDate
        content
        filename
        viewCount
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

// Query: getCategories
export const GET_CATEGORIES = gql`
  query GetCategories($limit: Int) {
    getCategories(limit: $limit) {
      name
      slug
      count
    }
  }
`;

// Query: getStiriByCategorySlug
export const GET_STIRI_BY_CATEGORY_SLUG = gql`
  query GetCategoryPage($slug: String!, $limit: Int, $offset: Int) {
    getStiriByCategorySlug(
      slug: $slug,
      limit: $limit,
      offset: $offset,
      orderBy: "publicationDate",
      orderDirection: "desc"
    ) {
      stiri {
        id
        title
        publicationDate
        content
        filename
        viewCount
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

// Query: getRelatedStories - pentru știrile relaționate
export const GET_RELATED_STORIES = gql`
  query GetRelatedStories($storyId: ID!, $limit: Int, $minScore: Float) {
    getRelatedStories(storyId: $storyId, limit: $limit, minScore: $minScore) {
      relatedStories {
        id
        title
        publicationDate
        content
        filename
        viewCount
        category
        relevanceScore
        relevanceReasons
      }
    }
  }
`;

// Query: getPersonalizedFeed - pentru feed-ul personalizat
export const GET_PERSONALIZED_FEED = gql`
  query GetPersonalizedFeed($limit: Int, $offset: Int, $orderBy: String, $orderDirection: String) {
    getPersonalizedFeed(
      limit: $limit
      offset: $offset
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      stiri {
        id
        title
        publicationDate
        content
        filename
        viewCount
        category
      }
      pagination {
        totalCount
        currentPage
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Query: getDocumentConnectionsByNews - conexiuni documente pentru o știre
export const GET_DOCUMENT_CONNECTIONS_BY_NEWS = gql`
  query GetDocConns($newsId: ID!, $relationType: String, $limit: Int, $offset: Int) {
    getDocumentConnectionsByNews(
      newsId: $newsId
      relationType: $relationType
      limit: $limit
      offset: $offset
    ) {
      idConexiune
      idStireSursa
      cheieDocumentSursa
      idStireTinta
      cheieDocumentTinta
      tipRelatie
      confidenceScore
      extractionMethod
    }
  }
`;
