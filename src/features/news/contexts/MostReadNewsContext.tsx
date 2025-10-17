'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { fetchMostReadStiri } from '../services/newsService';
import { NewsItem } from '../types';
import { type NewsViewPeriod } from '../config/periods';

interface MostReadNewsContextType {
  stiri: NewsItem[];
  isLoading: boolean;
  hasError: boolean;
  currentPeriod: NewsViewPeriod;
  setCurrentPeriod: (period: NewsViewPeriod) => void;
  refreshData: () => void;
}

const MostReadNewsContext = createContext<MostReadNewsContextType | undefined>(undefined);

interface MostReadNewsProviderProps {
  children: ReactNode;
}

export function MostReadNewsProvider({ children }: MostReadNewsProviderProps) {
  const [stiri, setStiri] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<NewsViewPeriod>('7d');
  const [hasLoaded, setHasLoaded] = useState(false);
  const isLoadingRef = useRef(false);

  const loadNews = useCallback(async (period: NewsViewPeriod) => {
    // Previne cererile duplicate
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setIsLoading(true);
    setHasError(false);
    try {
      const result = await fetchMostReadStiri({ limit: 15, period });
      setStiri(result.stiri || []);
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to load most read news:', error);
      setHasError(true);
      setStiri([]);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    loadNews(currentPeriod);
  }, [loadNews, currentPeriod]);

  // Load initial data
  useEffect(() => {
    if (!hasLoaded) {
      loadNews(currentPeriod);
    }
  }, [loadNews, currentPeriod, hasLoaded]);

  // Reload data when period changes
  useEffect(() => {
    if (hasLoaded) {
      loadNews(currentPeriod);
    }
  }, [loadNews, currentPeriod, hasLoaded]);

  const handlePeriodChange = (period: NewsViewPeriod) => {
    setCurrentPeriod(period);
    // loadNews will be called by the useEffect above
  };

  const value: MostReadNewsContextType = {
    stiri,
    isLoading,
    hasError,
    currentPeriod,
    setCurrentPeriod: handlePeriodChange,
    refreshData,
  };

  return (
    <MostReadNewsContext.Provider value={value}>
      {children}
    </MostReadNewsContext.Provider>
  );
}

export function useMostReadNews() {
  const context = useContext(MostReadNewsContext);
  if (context === undefined) {
    throw new Error('useMostReadNews must be used within a MostReadNewsProvider');
  }
  return context;
}
