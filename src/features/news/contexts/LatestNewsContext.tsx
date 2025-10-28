'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NewsItem } from '../types';

interface LatestNewsContextType {
  featured: NewsItem | null;
  setFeatured: (news: NewsItem | null) => void;
}

const LatestNewsContext = createContext<LatestNewsContextType | undefined>(undefined);

interface LatestNewsProviderProps {
  children: ReactNode;
}

export function LatestNewsProvider({ children }: LatestNewsProviderProps) {
  const [featured, setFeatured] = useState<NewsItem | null>(null);

  const value: LatestNewsContextType = {
    featured,
    setFeatured,
  };

  return (
    <LatestNewsContext.Provider value={value}>
      {children}
    </LatestNewsContext.Provider>
  );
}

export function useLatestNews() {
  const context = useContext(LatestNewsContext);
  if (context === undefined) {
    throw new Error('useLatestNews must be used within a LatestNewsProvider');
  }
  return context;
}
