import { gql } from 'graphql-request';
import { Comment, CommentsResponse, GetCommentsVariables, CreateCommentInput, UpdateCommentInput } from './types';

// Fragment for Comment data
const COMMENT_FRAGMENT = gql`
  fragment CommentData on Comment {
    id
    userId
    user {
      id
      email
      profile {
        id
        subscriptionTier
        displayName
        avatarUrl
      }
    }
    content
    parentType
    parentId
    isEdited
    editedAt
    createdAt
    updatedAt
    editHistory {
      id
      previousContent
      editedAt
    }
  }
`;

// Query to get comments
export const GET_COMMENTS = gql`
  ${COMMENT_FRAGMENT}
  query GetComments(
    $parentType: CommentParentType!
    $parentId: ID!
    $limit: Int
    $offset: Int
    $orderBy: String
    $orderDirection: String
  ) {
    getComments(
      parentType: $parentType
      parentId: $parentId
      limit: $limit
      offset: $offset
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      comments {
        ...CommentData
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

// Query to get a single comment by ID
export const GET_COMMENT_BY_ID = gql`
  ${COMMENT_FRAGMENT}
  query GetCommentById($id: ID!) {
    getCommentById(id: $id) {
      ...CommentData
    }
  }
`;

// Mutation to create a comment
export const CREATE_COMMENT = gql`
  ${COMMENT_FRAGMENT}
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      ...CommentData
    }
  }
`;

// Mutation to update a comment
export const UPDATE_COMMENT = gql`
  ${COMMENT_FRAGMENT}
  mutation UpdateComment($id: ID!, $input: UpdateCommentInput!) {
    updateComment(id: $id, input: $input) {
      ...CommentData
    }
  }
`;

// Mutation to delete a comment
export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;

// Type definitions for the queries
export type GetCommentsQuery = {
  getComments: CommentsResponse;
};

export type GetCommentByIdQuery = {
  getCommentById: Comment | null;
};

export type CreateCommentMutation = {
  createComment: Comment;
};

export type UpdateCommentMutation = {
  updateComment: Comment;
};

export type DeleteCommentMutation = {
  deleteComment: boolean;
};
