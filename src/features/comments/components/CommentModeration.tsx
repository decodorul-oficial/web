'use client';

import React, { useState } from 'react';
import { Comment } from '../types';
import { Flag, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface CommentModerationProps {
  comment: Comment;
  onModerate: (commentId: string, action: 'approve' | 'flag' | 'hide') => Promise<void>;
  isModerator?: boolean;
  className?: string;
}

export function CommentModeration({
  comment,
  onModerate,
  isModerator = false,
  className = ''
}: CommentModerationProps) {
  const [isModerating, setIsModerating] = useState(false);

  const handleModerate = async (action: 'approve' | 'flag' | 'hide') => {
    setIsModerating(true);
    try {
      await onModerate(comment.id, action);
    } catch (error) {
      console.error('Error moderating comment:', error);
    } finally {
      setIsModerating(false);
    }
  };

  if (!isModerator) {
    return (
      <button
        onClick={() => handleModerate('flag')}
        disabled={isModerating}
        className={`text-gray-400 hover:text-red-500 transition-colors ${className}`}
        title="Raportează comentariul"
      >
        <Flag className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => handleModerate('approve')}
        disabled={isModerating}
        className="text-green-400 hover:text-green-600 transition-colors"
        title="Aprobă comentariul"
      >
        <CheckCircle className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => handleModerate('flag')}
        disabled={isModerating}
        className="text-yellow-400 hover:text-yellow-600 transition-colors"
        title="Marchează comentariul"
      >
        <AlertTriangle className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => handleModerate('hide')}
        disabled={isModerating}
        className="text-red-400 hover:text-red-600 transition-colors"
        title="Ascunde comentariul"
      >
        <Shield className="h-4 w-4" />
      </button>
    </div>
  );
}
