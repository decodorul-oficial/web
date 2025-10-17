import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SavedSearchesService } from '../services/savedSearchesService';
import {
  SavedSearch,
  SavedSearchResponse,
  SaveSearchInput,
  UpdateSavedSearchInput,
  GetSavedSearchesParams,
  EmailNotificationInfo
} from '../types';

export function useSavedSearches(params: GetSavedSearchesParams = {}) {
  const { user, hasPremiumAccess } = useAuth();
  const [data, setData] = useState<SavedSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSavedSearches = useCallback(async () => {
    if (!user || !hasPremiumAccess) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await SavedSearchesService.getSavedSearches(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch saved searches'));
    } finally {
      setLoading(false);
    }
  }, [user, hasPremiumAccess, params.limit, params.offset, params.orderBy, params.orderDirection, params.favoritesOnly]);

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  const refetch = useCallback(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  return {
    data,
    loading,
    error,
    refetch,
    hasAccess: hasPremiumAccess
  };
}

export function useSaveSearch() {
  const { user, hasPremiumAccess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveSearch = useCallback(async (input: SaveSearchInput): Promise<SavedSearch | null> => {
    if (!user || !hasPremiumAccess) {
      setError(new Error('Premium access required'));
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await SavedSearchesService.saveSearch(input);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save search';
      setError(new Error(errorMessage));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, hasPremiumAccess]);

  return {
    saveSearch,
    loading,
    error
  };
}

export function useUpdateSavedSearch() {
  const { user, hasPremiumAccess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateSavedSearch = useCallback(async (id: string, input: UpdateSavedSearchInput): Promise<SavedSearch | null> => {
    if (!user || !hasPremiumAccess) {
      setError(new Error('Premium access required'));
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await SavedSearchesService.updateSavedSearch(id, input);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update search';
      setError(new Error(errorMessage));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, hasPremiumAccess]);

  return {
    updateSavedSearch,
    loading,
    error
  };
}

export function useDeleteSavedSearch() {
  const { user, hasPremiumAccess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteSavedSearch = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !hasPremiumAccess) {
      setError(new Error('Premium access required'));
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await SavedSearchesService.deleteSavedSearch(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete search';
      setError(new Error(errorMessage));
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, hasPremiumAccess]);

  return {
    deleteSavedSearch,
    loading,
    error
  };
}

export function useToggleFavoriteSearch() {
  const { user, hasPremiumAccess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggleFavoriteSearch = useCallback(async (id: string): Promise<SavedSearch | null> => {
    if (!user || !hasPremiumAccess) {
      setError(new Error('Premium access required'));
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await SavedSearchesService.toggleFavoriteSearch(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle favorite';
      setError(new Error(errorMessage));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, hasPremiumAccess]);

  return {
    toggleFavoriteSearch,
    loading,
    error
  };
}

export function useEmailNotificationInfo() {
  const { user, hasPremiumAccess } = useAuth();
  const [data, setData] = useState<EmailNotificationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmailNotificationInfo = useCallback(async () => {
    if (!user || !hasPremiumAccess) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await SavedSearchesService.getEmailNotificationInfo();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch email notification info'));
    } finally {
      setLoading(false);
    }
  }, [user, hasPremiumAccess]);

  useEffect(() => {
    fetchEmailNotificationInfo();
  }, [fetchEmailNotificationInfo]);

  const refetch = useCallback(() => {
    fetchEmailNotificationInfo();
  }, [fetchEmailNotificationInfo]);

  return {
    data,
    loading,
    error,
    refetch,
    hasAccess: hasPremiumAccess
  };
}

export function useToggleEmailNotifications() {
  const { user, hasPremiumAccess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggleEmailNotifications = useCallback(async (id: string, enabled: boolean): Promise<SavedSearch | null> => {
    if (!user || !hasPremiumAccess) {
      setError(new Error('Premium access required'));
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await SavedSearchesService.toggleEmailNotifications(id, enabled);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle email notifications';
      setError(new Error(errorMessage));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, hasPremiumAccess]);

  return {
    toggleEmailNotifications,
    loading,
    error
  };
}
