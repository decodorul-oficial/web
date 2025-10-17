'use client';

import React from 'react';
import { MessageCircle, Users, TrendingUp } from 'lucide-react';

interface CommentStatsProps {
  totalComments: number;
  uniqueCommenters: number;
  recentActivity?: boolean;
  className?: string;
}

export function CommentStats({
  totalComments,
  uniqueCommenters,
  recentActivity = false,
  className = ''
}: CommentStatsProps) {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">Statistici comentarii</h4>
        {recentActivity && (
          <div className="flex items-center text-green-600 text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Activitate recentă
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <MessageCircle className="h-4 w-4 text-brand mr-1" />
            <span className="text-lg font-semibold text-gray-900">
              {totalComments}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {totalComments === 1 ? 'Comentariu' : 'Comentarii'}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="h-4 w-4 text-brand mr-1" />
            <span className="text-lg font-semibold text-gray-900">
              {uniqueCommenters}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {uniqueCommenters === 1 ? 'Participant' : 'Participanți'}
          </p>
        </div>
      </div>
    </div>
  );
}
