"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { fetchCategories } from '@/features/news/services/newsService';
import { useAuth } from '@/components/auth/AuthProvider';

type Category = { slug: string; name: string; count: number };

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

interface CategoriesProviderProps {
  children: ReactNode;
}

export function CategoriesProvider({ children }: CategoriesProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Reset state when user changes
  useEffect(() => {
    if (user) {
      setHasFetched(false);
      setError(null);
    }
  }, [user]);

  const fetchCategoriesData = useCallback(async () => {
    // Only fetch if user is authenticated and we haven't fetched yet
    if (!user || hasFetched) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const cats = await fetchCategories(100);
      const mapped = cats.map((c) => ({ slug: c.slug, name: c.name, count: c.count }));
      setCategories(mapped);
      setHasFetched(true);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Check if it's a subscription error
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      if (errorMessage.includes('SUBSCRIPTION_REQUIRED') || errorMessage.includes('subscription')) {
        setError('SUBSCRIPTION_REQUIRED');
      } else {
        setError('Failed to fetch categories');
      }
    } finally {
      setLoading(false);
    }
  }, [user, hasFetched]);

  const refetch = async () => {
    setHasFetched(false);
    await fetchCategoriesData();
  };

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (user && !hasFetched) {
      fetchCategoriesData();
    } else if (!user) {
      // Reset when user logs out or is not authenticated
      setCategories([]);
      setHasFetched(false);
      setError(null);
      setLoading(false);
    } else if (user && hasFetched) {
      // User is authenticated and we have fetched data, ensure loading is false
      setLoading(false);
    }
  }, [user, hasFetched, fetchCategoriesData, authLoading]);

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    refetch,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextType {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
