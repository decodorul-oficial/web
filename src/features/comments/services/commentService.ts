import { getGraphQLClient } from '@/lib/graphql/client';
import { UserService } from '@/features/user/services/userService';
import {
  GET_COMMENTS,
  GET_COMMENT_BY_ID,
  CREATE_COMMENT,
  UPDATE_COMMENT,
  DELETE_COMMENT,
  GetCommentsQuery,
  GetCommentByIdQuery,
  CreateCommentMutation,
  UpdateCommentMutation,
  DeleteCommentMutation
} from '../queries';
import {
  Comment,
  CommentsResponse,
  GetCommentsVariables,
  CreateCommentInput,
  UpdateCommentInput,
  CommentParentType
} from '../types';

export class CommentService {
  // Creează un client care știe să se autentifice conform ghidului
  private getApiClient() {
    const token = UserService.getAuthToken(); // Obține token-ul de la gardian
    
    // Debug logging pentru a verifica dacă token-ul este trimis
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV>>>CommentService: Token available:', !!token);
    }
    
    return getGraphQLClient({
      getAuthToken: () => token || undefined // Convertim null la undefined
    });
  }

  async getComments(variables: GetCommentsVariables): Promise<CommentsResponse> {
    try {
      const client = this.getApiClient();
      const response = await client.request<GetCommentsQuery>(GET_COMMENTS, variables);
      return response.getComments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }
  }

  async getCommentById(id: string): Promise<Comment | null> {
    try {
      const client = this.getApiClient();
      const response = await client.request<GetCommentByIdQuery>(GET_COMMENT_BY_ID, { id });
      return response.getCommentById;
    } catch (error) {
      console.error('Error fetching comment by ID:', error);
      throw new Error('Failed to fetch comment');
    }
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    try {
      const client = this.getApiClient();
      const response = await client.request<CreateCommentMutation>(CREATE_COMMENT, { input });
      return response.createComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw new Error('Failed to create comment');
    }
  }

  async updateComment(id: string, input: UpdateCommentInput): Promise<Comment> {
    try {
      const client = this.getApiClient();
      const response = await client.request<UpdateCommentMutation>(UPDATE_COMMENT, { id, input });
      return response.updateComment;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw new Error('Failed to update comment');
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    try {
      const client = this.getApiClient();
      const response = await client.request<DeleteCommentMutation>(DELETE_COMMENT, { id });
      return response.deleteComment;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error('Failed to delete comment');
    }
  }

  // Helper method to get comments for a specific parent
  async getCommentsForParent(
    parentType: CommentParentType,
    parentId: string,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: string;
    } = {}
  ): Promise<CommentsResponse> {
    return this.getComments({
      parentType,
      parentId,
      limit: options.limit || 10,
      offset: options.offset || 0,
      orderBy: options.orderBy || 'createdAt',
      orderDirection: options.orderDirection || 'DESC'
    });
  }
}

// Export singleton instance
export const commentService = new CommentService();
