'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, X, Lock } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useConsent } from '@/components/cookies/ConsentProvider';
import { useFavoriteToggle } from '@/features/favorites/hooks/useFavorites';

interface FavoriteButtonProps {
  newsId: string;
  newsTitle: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  tooltipDirection?: 'up' | 'right';
  initialIsFavorite?: boolean;
}

export function FavoriteButton({ 
  newsId, 
  newsTitle, 
  className = '',
  size = 'md',
  showLabel = false,
  tooltipDirection = 'up',
  initialIsFavorite
}: FavoriteButtonProps) {
  const { isAuthenticated, hasPremiumAccess, loading: authLoading } = useAuth();
  const { consent, isLoaded: consentLoaded } = useConsent();
  const { isFavorite, loading: favoriteLoading, toggleFavorite, canUseFavorites } = useFavoriteToggle(newsId, initialIsFavorite);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) {
        setTooltipText('Conectează-te pentru a salva favorite');
      } else if (!hasPremiumAccess) {
        setTooltipText('Abonament premium necesar');
      } else if (!consent) {
        setTooltipText('Acceptă cookie-urile pentru a salva favorite');
      } else {
        setTooltipText(isFavorite ? 'Șterge de la favorite' : 'Adaugă la favorite');
      }
    }
  }, [isFavorite, isClient, isAuthenticated, hasPremiumAccess, consent]);

  const handleClick = async () => {
    if (favoriteLoading) return;

    // Check authentication and premium access
    if (!isAuthenticated) {
      setNotificationText('Trebuie să te conectezi pentru a salva favorite.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
      return;
    }

    if (!hasPremiumAccess) {
      setNotificationText('Abonament premium necesar pentru a salva favorite.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
      return;
    }

    if (!consent) {
      setNotificationText('Trebuie să accepți cookie-urile pentru a salva favorite.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
      return;
    }

    // Micro-interaction: button pop effect
    const button = document.getElementById(`favorite-btn-${newsId}`);
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    }

    try {
      const response = await toggleFavorite();
      
      if (response) {
        setNotificationText(response.message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 4000);
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setNotificationText('A apărut o eroare. Te rugăm să încerci din nou.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    }
  };

  const handleMouseEnter = () => {
    if (isClient) {
      setTimeout(() => setShowTooltip(true), 200);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const baseClasses = `
    ${sizeClasses[size]}
    flex items-center justify-center
    rounded-lg
    transition-all duration-200
    ${isFavorite 
      ? 'bg-gradient-to-r from-brand-info to-brand-accent border border-brand-info/30 shadow-md hover:shadow-lg hover:scale-105' 
      : `border border-gray-200 bg-white hover:shadow-md ${!isFavorite && isAuthenticated && hasPremiumAccess && consent ? 'animate-pulse-brand border-brand-info' : ''}`
    }
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand
    relative
    group
    ${favoriteLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
    ${className}
  `;

  const iconClasses = `
    ${iconSizes[size]}
    transition-all duration-200
    ${isFavorite 
      ? 'text-white drop-shadow-sm' 
      : `${isAuthenticated && hasPremiumAccess && consent ? 'text-brand-info' : 'text-gray-500'} group-hover:text-brand-info group-hover:scale-110`
    }
  `;

  if (!isClient || authLoading || !consentLoaded || favoriteLoading) {
    return (
      <div className={`${baseClasses} ${sizeClasses[size]}`}>
        <Bookmark className={`${iconSizes[size]} text-gray-300`} />
      </div>
    );
  }

  // Hide button completely if no cookie consent
  if (!consent) {
    return null;
  }

  // Show locked state for non-authenticated or non-premium users
  if (!isAuthenticated || !hasPremiumAccess) {
    return (
      <div className="relative">
        <button
          id={`favorite-btn-${newsId}`}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={baseClasses}
          disabled={true}
          aria-label={!isAuthenticated ? 'Conectează-te pentru a salva favorite' : 'Abonament premium necesar'}
          title={!isAuthenticated ? 'Conectează-te pentru a salva favorite' : 'Abonament premium necesar'}
        >
          <Lock className={`${iconSizes[size]} text-gray-400`} />
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className={`absolute z-50 ${
            tooltipDirection === 'up' 
              ? '-top-10 left-1/2 transform -translate-x-1/2' 
              : 'left-full top-1/2 transform -translate-y-1/2 ml-2'
          }`}>
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {tooltipText}
              {tooltipDirection === 'up' ? (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
              ) : (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
              )}
            </div>
          </div>
        )}

        {showLabel && (
          <span className="ml-2 text-sm font-medium text-gray-500 hidden sm:inline">
            {!isAuthenticated ? 'Conectează-te' : 'Premium necesar'}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          id={`favorite-btn-${newsId}`}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={baseClasses}
          disabled={favoriteLoading}
          aria-label={isFavorite ? 'Șterge de la favorite' : 'Adaugă la favorite'}
          title={isFavorite ? 'Șterge de la favorite' : 'Adaugă la favorite'}
        >
          {isFavorite ? (
            <BookmarkCheck className={iconClasses} />
          ) : (
            <Bookmark className={iconClasses} />
          )}
          
          {favoriteLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-brand-info border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className={`absolute z-50 ${
            tooltipDirection === 'up' 
              ? '-top-10 left-1/2 transform -translate-x-1/2' 
              : 'left-full top-1/2 transform -translate-y-1/2 ml-2'
          }`}>
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {tooltipText}
              {tooltipDirection === 'up' ? (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
              ) : (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
              )}
            </div>
          </div>
        )}

        {showLabel && (
          <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:inline">
            {isFavorite ? 'În favorite' : 'Adaugă la favorite'}
          </span>
        )}
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-24 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-right-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {isFavorite ? (
                <BookmarkCheck className="w-5 h-5 text-brand-info" />
              ) : (
                <X className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notificationText}
              </p>
              {isFavorite && (
                <button 
                  onClick={() => {
                    window.location.href = '/favorite';
                  }}
                  className="text-xs text-brand-info hover:underline mt-1"
                >
                  Vezi lista
                </button>
              )}
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
