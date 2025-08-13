import { gql } from 'graphql-request';

export const GET_STIRI = gql`
  query GetStiri($limit: Int!, $offset: Int!, $orderBy: String!, $orderDirection: String!) {
    getStiri(limit: $limit, offset: $offset, orderBy: $orderBy, orderDirection: $orderDirection) {
      stiri {
        id
        title
        publicationDate
        content {
          body
          author
          summary
          category
          keywords
        }
      }
      pagination {
        totalCount
        currentPage
        totalPages
      }
    }
  }
`;


