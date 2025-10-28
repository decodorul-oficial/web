'use client';

import React, { useState } from 'react';
import { Comment, CommentFormData, CommentFilters } from '../types';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { ChevronLeft, ChevronRight, MessageCircle, Loader2, Users, TrendingUp, RefreshCw } from 'lucide-react';

interface CommentListProps {
  comments: Comment[];
  pagination: {
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
  currentUserId?: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onCommentSubmit: (data: CommentFormData) => Promise<void>;
  onCommentEdit: (commentId: string, newContent: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  isSubmittingComment?: boolean;
  className?: string;
}

export function CommentList({
  comments,
  pagination,
  currentUserId,
  isLoading = false,
  onLoadMore,
  onRefresh,
  onCommentSubmit,
  onCommentEdit,
  onCommentDelete,
  isSubmittingComment = false,
  className = ''
}: CommentListProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const handleEditStart = (commentId: string) => {
    setEditingCommentId(commentId);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
  };

  const handleEdit = async (commentId: string, newContent: string) => {
    await onCommentEdit(commentId, newContent);
    setEditingCommentId(null);
  };

  const handleDelete = async (commentId: string) => {
    await onCommentDelete(commentId);
  };

  if (isLoading && comments.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-2" />
          <p className="text-gray-600">Se încarcă comentariile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-brand" />
          <h3 className="text-lg font-semibold text-gray-900">
            Comentarii ({pagination.totalCount})
          </h3>
        </div>
        <div className="flex items-center space-x-4">
          {/* Comment Stats - moved to header */}
          {comments.length > 0 && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4 text-brand" />
                <span>{pagination.totalCount} {pagination.totalCount === 1 ? 'Comentariu' : 'Comentarii'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-brand" />
                <span>{new Set(comments.map(c => c.userId)).size} {new Set(comments.map(c => c.userId)).size === 1 ? 'Participant' : 'Participanți'}</span>
              </div>
              {comments.some(c => {
                const commentDate = new Date(c.createdAt);
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return commentDate > oneDayAgo;
              }) && (
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Activitate recentă</span>
                </div>
              )}
            </div>
          )}
          <div className="h-6 w-px bg-gray-600 mx-2" />
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-sm text-brand hover:text-brand-highlight transition-colors"
              disabled={isLoading}
            >
              <span className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Comment Form */}
      <div className="bg-gray-50 rounded-lg p-4">
        <CommentForm
          onSubmit={onCommentSubmit}
          isSubmitting={isSubmittingComment}
          placeholder="Scrieți comentariul..."
        />
      </div>


      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nu există comentarii încă</p>
          <p className="text-gray-400 text-sm mt-1">
            Fiți primul care comentează!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isEditing={editingCommentId === comment.id}
              onEditStart={handleEditStart}
              onEditCancel={handleEditCancel}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Pagina {pagination.currentPage} din {pagination.totalPages}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onLoadMore}
              disabled={!pagination.hasNextPage || isLoading}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              Încarcă mai multe
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator for additional comments */}
      {isLoading && comments.length > 0 && (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}
    </div>
  );
}
