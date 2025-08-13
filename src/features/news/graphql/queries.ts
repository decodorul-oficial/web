import { gql } from 'graphql-request';

export const GET_STIRI = gql`
  query GetStiri($limit: Int!, $offset: Int!, $orderBy: String!, $orderDirection: String!) {
    getStiri(limit: $limit, offset: $offset, orderBy: $orderBy, orderDirection: $orderDirection) {
      stiri {
        id
        title
        publicationDate
        content
      }
      pagination {
        totalCount
        currentPage
        totalPages
      }
    }
  }
`;

export const GET_STIRE_BY_ID = gql`
  query GetStireById($id: ID!) {
    getStireById(id: $id) {
      id
      title
      publicationDate
      createdAt
      updatedAt
      content
    }
  }
`;


