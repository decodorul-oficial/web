import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useConsent } from '@/components/cookies/ConsentProvider';
import { FavoriteService, GetFavoriteNewsParams } from '../services/favoriteService';
import { FavoriteNews, ToggleFavoriteNewsResponse } from '../graphql/queries';

export function useFavorites() {
  const { isAuthenticated, hasPremiumAccess } = useAuth();
  const { consent } = useConsent();
  const [favorites, setFavorites] = useState<FavoriteNews[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async (params: GetFavoriteNewsParams = {}) => {
    if (!isAuthenticated || !hasPremiumAccess || !consent) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await FavoriteService.getFavoriteNews(params);
      setFavorites(response.favoriteNews);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, hasPremiumAccess, consent]);

  const toggleFavorite = useCallback(async (newsId: string): Promise<ToggleFavoriteNewsResponse | null> => {
    if (!isAuthenticated || !hasPremiumAccess || !consent) {
      throw new Error('Authentication, premium access, or cookie consent required');
    }

    try {
      setError(null);
      const response = await FavoriteService.toggleFavoriteNews(newsId);
      
      // Update local state
      if (response.isFavorite) {
        // Add to favorites
        setFavorites(prev => {
          const exists = prev.some(fav => fav.newsId === newsId);
          if (!exists && response.favoriteNews) {
            return [...prev, response.favoriteNews];
          }
          return prev;
        });
      } else {
        // Remove from favorites
        setFavorites(prev => prev.filter(fav => fav.newsId !== newsId));
      }
      
      return response;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      throw err;
    }
  }, [isAuthenticated, hasPremiumAccess, consent]);

  const clearAllFavorites = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !hasPremiumAccess || !consent) {
      throw new Error('Authentication, premium access, or cookie consent required');
    }

    try {
      setError(null);
      await FavoriteService.clearAllFavoriteNews();
      setFavorites([]);
    } catch (err) {
      console.error('Error clearing all favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear all favorites');
      throw err;
    }
  }, [isAuthenticated, hasPremiumAccess, consent]);

  const isFavorite = useCallback((newsId: string): boolean => {
    return favorites.some(fav => fav.newsId === newsId);
  }, [favorites]);

  // Load favorites when dependencies change
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    error,
    loadFavorites,
    toggleFavorite,
    clearAllFavorites,
    isFavorite,
    canUseFavorites: isAuthenticated && hasPremiumAccess && consent
  };
}

export function useFavoriteToggle(newsId: string, initialIsFavorite?: boolean) {
  const { isAuthenticated, hasPremiumAccess } = useAuth();
  const { consent } = useConsent();
  const [isFavorite, setIsFavorite] = useState(!!initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkFavoriteStatus = useCallback(async () => {
    if (!isAuthenticated || !hasPremiumAccess || !consent) {
      setIsFavorite(false);
      return;
    }

    // If an initial favorite status is provided, trust it and skip fetching
    if (typeof initialIsFavorite === 'boolean') {
      setIsFavorite(initialIsFavorite);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const isFav = await FavoriteService.isFavoriteNews(newsId);
      setIsFavorite(isFav);
    } catch (err) {
      console.error('Error checking favorite status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check favorite status');
    } finally {
      setLoading(false);
    }
  }, [newsId, isAuthenticated, hasPremiumAccess, consent, initialIsFavorite]);

  const toggleFavorite = useCallback(async (): Promise<ToggleFavoriteNewsResponse | null> => {
    if (!isAuthenticated || !hasPremiumAccess || !consent) {
      throw new Error('Authentication, premium access, or cookie consent required');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await FavoriteService.toggleFavoriteNews(newsId);
      setIsFavorite(response.isFavorite);
      return response;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [newsId, isAuthenticated, hasPremiumAccess, consent]);

  // Check favorite status when dependencies change
  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  return {
    isFavorite,
    loading,
    error,
    toggleFavorite,
    canUseFavorites: isAuthenticated && hasPremiumAccess && consent
  };
}
