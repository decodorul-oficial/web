'use client';

import { useState, useEffect, useCallback } from 'react';
import { commentService } from '../services/commentService';
import { Comment, CommentFormData, CommentParentType, CommentFilters } from '../types';

interface UseCommentsOptions {
  parentType: CommentParentType;
  parentId: string;
  initialFilters?: Partial<CommentFilters>;
  autoLoad?: boolean;
}

interface UseCommentsReturn {
  comments: Comment[];
  pagination: {
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  filters: CommentFilters;
  loadComments: (newFilters?: Partial<CommentFilters>) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  submitComment: (data: CommentFormData) => Promise<void>;
  editComment: (commentId: string, newContent: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  updateFilters: (newFilters: Partial<CommentFilters>) => void;
}

const DEFAULT_FILTERS: CommentFilters = {
  orderBy: 'createdAt',
  orderDirection: 'DESC',
  limit: 10,
  offset: 0
};

export function useComments({
  parentType,
  parentId,
  initialFilters = {},
  autoLoad = true
}: UseCommentsOptions): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    currentPage: 1,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<CommentFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });

  const loadComments = useCallback(async (newFilters?: Partial<CommentFilters>) => {
    if (newFilters) {
      setFilters(prev => ({ ...prev, ...newFilters }));
    }

    const currentFilters = newFilters ? { ...filters, ...newFilters } : filters;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await commentService.getCommentsForParent(
        parentType,
        parentId,
        currentFilters
      );

      setComments(response.comments);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load comments';
      setError(errorMessage);
      console.error('Error loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [parentType, parentId, filters]);

  const loadMore = useCallback(async () => {
    if (!pagination.hasNextPage || isLoading) return;

    const newOffset = filters.offset + filters.limit;
    await loadComments({ offset: newOffset });
  }, [pagination.hasNextPage, isLoading, filters.offset, filters.limit, loadComments]);

  const refresh = useCallback(async () => {
    await loadComments({ offset: 0 });
  }, [loadComments]);

  const submitComment = useCallback(async (data: CommentFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newComment = await commentService.createComment({
        content: data.content,
        parentType,
        parentId
      });

      // Add the new comment to the beginning of the list
      setComments(prev => [newComment, ...prev]);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        totalCount: prev.totalCount + 1
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit comment';
      setError(errorMessage);
      console.error('Error submitting comment:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [parentType, parentId]);

  const editComment = useCallback(async (commentId: string, newContent: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedComment = await commentService.updateComment(commentId, {
        content: newContent
      });

      // Update the comment in the list
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? updatedComment : comment
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update comment';
      setError(errorMessage);
      console.error('Error updating comment:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await commentService.deleteComment(commentId);

      // Remove the comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        totalCount: Math.max(0, prev.totalCount - 1)
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      console.error('Error deleting comment:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<CommentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Auto-load comments on mount or when dependencies change
  useEffect(() => {
    if (autoLoad && parentId) {
      loadComments();
    }
  }, [autoLoad, parentId, loadComments]);

  return {
    comments,
    pagination,
    isLoading,
    error,
    isSubmitting,
    filters,
    loadComments,
    loadMore,
    refresh,
    submitComment,
    editComment,
    deleteComment,
    updateFilters
  };
}
