'use client';

import React from 'react';
import { CommentParentType } from '../types';
import { CommentList } from './CommentList';
import { useComments } from '../hooks/useComments';
import { useAuth } from '@/components/auth/AuthProvider';
import { CommentErrorBoundary } from './CommentErrorBoundary';

interface CommentsSectionProps {
  parentType: CommentParentType;
  parentId: string;
  className?: string;
}

export function CommentsSection({
  parentType,
  parentId,
  className = ''
}: CommentsSectionProps) {
  const { user } = useAuth();
  const {
    comments,
    pagination,
    isLoading,
    error,
    isSubmitting,
    loadMore,
    refresh,
    submitComment,
    editComment,
    deleteComment
  } = useComments({
    parentType,
    parentId,
    autoLoad: true
  });

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="text-red-600 text-sm">
            <strong>Eroare la încărcarea comentariilor:</strong> {error}
          </div>
          <button
            onClick={refresh}
            className="ml-4 text-red-600 hover:text-red-800 text-sm underline"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  return (
    <CommentErrorBoundary>
      <div className={className}>
        <CommentList
          comments={comments}
          pagination={pagination}
          currentUserId={user?.id}
          isLoading={isLoading}
          onLoadMore={loadMore}
          onRefresh={refresh}
          onCommentSubmit={submitComment}
          onCommentEdit={editComment}
          onCommentDelete={deleteComment}
          isSubmittingComment={isSubmitting}
        />
      </div>
    </CommentErrorBoundary>
  );
}
