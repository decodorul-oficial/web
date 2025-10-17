'use client';

import React, { useState } from 'react';
import { Comment, User } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Edit2, Trash2, MoreVertical, Check, X, User as UserIcon } from 'lucide-react';
// Removed massive Lucide import - using specific imports instead
import { getLucideIcon as getLazyLucideIcon } from '@/lib/optimizations/lazyIcons';

// Helper function to get user initials
const getUserInitials = (user: User | undefined): string => {
  const displayName = user?.profile?.displayName;
  if (!displayName) {
    return '?';
  }
  
  const name = displayName.trim();
  const words = name.split(' ');
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Helper function to get Lucide icon component from URL
const getLucideIcon = (avatarUrl: string | null | undefined) => {
  if (!avatarUrl) return UserIcon;
  
  try {
    // Extract icon name from URL like "https://lucide.dev/icons/crown"
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split('/');
    const iconName = pathParts[pathParts.length - 1]; // Get "crown" from "/icons/crown"
    
    // Convert to PascalCase (crown -> Crown)
    const pascalCaseName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    
    // Get the icon component using lazy loading
    getLazyLucideIcon(pascalCaseName, UserIcon).then(icon => {
      // This will be handled asynchronously
    });
    return UserIcon; // Return fallback immediately
  } catch (error) {
    console.warn('Invalid avatar URL:', avatarUrl, error);
    return UserIcon;
  }
};

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onEdit: (commentId: string, newContent: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isEditing?: boolean;
  onEditStart?: (commentId: string) => void;
  onEditCancel?: () => void;
}

export function CommentItem({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  isEditing = false,
  onEditStart,
  onEditCancel
}: CommentItemProps) {
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isOwner = currentUserId === comment.userId;
  const canEdit = isOwner && !isSubmitting;
  const canDelete = isOwner && !isSubmitting;
  
  // Blur logic: only for unauthenticated users
  const shouldBlurName = !currentUserId;

  const handleEditSubmit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      onEditCancel?.();
      return;
    }

    setIsSubmitting(true);
    try {
      await onEdit(comment.id, editContent.trim());
      onEditCancel?.();
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setEditContent(comment.content);
    onEditCancel?.();
  };

  const handleDelete = async () => {
    if (!confirm('Sigur doriți să ștergeți acest comentariu?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ro
      });
    } catch {
      return 'Data invalida';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center">
            {comment.user?.profile?.avatarUrl ? (
              (() => {
                const IconComponent = getLucideIcon(comment.user.profile.avatarUrl);
                return (
                  <div className="w-full h-full bg-brand rounded-full flex items-center justify-center text-white">
                    <IconComponent className="w-4 h-4" />
                  </div>
                );
              })()
            ) : (
              <div className="w-full h-full bg-brand rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials(comment.user)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="font-semibold text-gray-900 text-sm">
                  {comment.user?.profile?.displayName || 'Utilizator necunoscut'}
                </span>
                {/* Blurred overlay for unauthenticated users */}
                {shouldBlurName && (
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-sm"></div>
                )}
              </div>
              {comment.user?.profile?.subscriptionTier && comment.user.profile.subscriptionTier !== 'free' && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  comment.user.profile.subscriptionTier === 'pro' 
                    ? 'bg-gradient-to-r from-brand-info to-brand-accent text-white' 
                    : 'bg-gradient-to-r from-brand-info to-brand-accent text-white'
                }`}>
                  {comment.user.profile.subscriptionTier === 'pro' ? 'PRO' : 'ENTERPRISE'}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
              {comment.isEdited && comment.editedAt && (
                <span className="ml-2 text-gray-400">
                  (modificat {formatDate(comment.editedAt)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions menu */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onEditStart?.(comment.id);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  disabled={!canEdit}
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Editează</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  disabled={!canDelete}
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Șterge</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="text-gray-800 leading-relaxed">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-brand focus:border-transparent"
              rows={3}
              placeholder="Scrieți comentariul..."
              disabled={isSubmitting}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleEditCancel}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={!editContent.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm bg-brand text-white rounded-md hover:bg-brand-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{comment.content}</div>
        )}
      </div>

      {/* Edit history - only for authenticated users */}
      {currentUserId && comment.editHistory && comment.editHistory.length > 0 && (
        <details className="mt-3 text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            Istoric modificări ({comment.editHistory.length})
          </summary>
          <div className="mt-2 space-y-1 pl-4 border-l-2 border-gray-200">
            {comment.editHistory.map((edit, index) => (
              <div key={edit.id} className="py-1">
                <div className="font-medium">
                  Versiunea {comment.editHistory.length - index}
                </div>
                <div className="text-gray-600 mt-1">
                  {edit.previousContent}
                </div>
                <div className="text-gray-400 mt-1">
                  {formatDate(edit.editedAt)}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
