export enum CommentParentType {
  STIRE = 'STIRE',
  SYNTHESIS = 'SYNTHESIS'
}

export interface CommentEdit {
  id: string;
  previousContent: string;
  editedAt: string;
}

export interface User {
  id: string;
  email: string;
  profile: {
    id: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  parentType: CommentParentType;
  parentId: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  editHistory: CommentEdit[];
}

export interface PaginationInfo {
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: PaginationInfo;
}

export interface CreateCommentInput {
  content: string;
  parentType: CommentParentType;
  parentId: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface GetCommentsVariables {
  parentType: CommentParentType;
  parentId: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: string;
}

export interface CommentFormData {
  content: string;
}

export interface CommentFilters {
  orderBy: 'createdAt' | 'updatedAt';
  orderDirection: 'ASC' | 'DESC';
  limit: number;
  offset: number;
}
