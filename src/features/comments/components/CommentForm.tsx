'use client';

import React, { useState } from 'react';
import { CommentFormData } from '../types';
import { Send, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { DisplayNameNotification } from '@/components/comments/DisplayNameNotification';

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
  className?: string;
}

export function CommentForm({
  onSubmit,
  isSubmitting = false,
  placeholder = 'Scrieți comentariul...',
  className = ''
}: CommentFormProps) {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState<CommentFormData>({
    content: ''
  });
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const [showDisplayNameNotification, setShowDisplayNameNotification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim() || isLocalSubmitting || isSubmitting) {
      return;
    }

    // Check if user has display name set, if not show notification
    if (user && !profile?.displayName && !profile?.full_name) {
      setShowDisplayNameNotification(true);
      return;
    }

    setIsLocalSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ content: '' });
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const handleDisplayNameSet = (displayName: string) => {
    setShowDisplayNameNotification(false);
    // After setting display name, submit the comment
    handleSubmitAfterNameSet();
  };

  const handleContinueWithoutName = () => {
    setShowDisplayNameNotification(false);
    // Submit comment with "Utilizator necunoscut" as display name
    handleSubmitAfterNameSet();
  };

  const handleSubmitAfterNameSet = async () => {
    if (!formData.content.trim() || isLocalSubmitting || isSubmitting) {
      return;
    }

    setIsLocalSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ content: '' });
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      content: e.target.value
    });
  };

  const isDisabled = isLocalSubmitting || isSubmitting || !formData.content.trim();

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <LogIn className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Autentificați-vă pentru a comenta
        </h3>
        <p className="text-gray-600 mb-4">
          Trebuie să vă autentificați pentru a putea lăsa comentarii.
        </p>
        <div className="flex justify-center space-x-3">
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-highlight transition-colors"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Autentificare
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Înregistrare
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Display Name Notification */}
      {showDisplayNameNotification && (
        <DisplayNameNotification
          onDisplayNameSet={handleDisplayNameSet}
          onContinueWithoutName={handleContinueWithoutName}
          className="mb-4"
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="comment-content" className="sr-only">
            Comentariu
          </label>
          <textarea
            id="comment-content"
            value={formData.content}
            onChange={handleChange}
            placeholder={placeholder}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLocalSubmitting || isSubmitting}
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isDisabled}
            className="inline-flex items-center px-4 py-2 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLocalSubmitting || isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Se trimite...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Trimite comentariul
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
