'use client';

import { useState, useEffect } from 'react';
import { getNewsletterStats } from '../../lib/utils/newsletterTracking';

interface NewsletterTrackingStatsProps {
  showDetails?: boolean;
}

export const NewsletterTrackingStats = ({ showDetails = false }: NewsletterTrackingStatsProps) => {
  const [stats, setStats] = useState<{
    newsViewed: number;
    isSubscribed: boolean;
    lastModalShown: number;
    lastViewedNews?: string;
  } | null>(null);

  useEffect(() => {
    const loadStats = () => {
      const currentStats = getNewsletterStats();
      setStats(currentStats);
    };

    loadStats();
    
    // Actualizează statisticile la fiecare 5 secunde
    const interval = setInterval(loadStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
      <h3 className="font-medium text-gray-900 mb-2">
        📊 Statistici Newsletter Tracking
      </h3>
      
      <div className="space-y-1 text-gray-700">
        <div className="flex justify-between">
          <span>Știri vizualizate:</span>
          <span className="font-medium">{stats.newsViewed}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Status abonare:</span>
          <span className={`font-medium ${stats.isSubscribed ? 'text-green-600' : 'text-gray-600'}`}>
            {stats.isSubscribed ? 'Abonat' : 'Neabonat'}
          </span>
        </div>
        
        {showDetails && (
          <>
            <div className="flex justify-between">
              <span>Ultima afișare modal:</span>
              <span className="font-medium">{stats.lastModalShown}</span>
            </div>
            <div className="flex justify-between">
              <span>Ultima știre vizualizată:</span>
              <span className="font-medium text-xs font-mono">
                {stats.lastViewedNews ? stats.lastViewedNews.substring(0, 8) + '...' : 'Niciuna'}
              </span>
            </div>
          </>
        )}
      </div>
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p><strong>Intervale afișare:</strong> 3, 6, 9 știri</p>
            <p><strong>Cooldown:</strong> 24 ore între afișări</p>
            <p><strong>Tracking activ:</strong> Doar cu consimțământ analytics</p>
          </div>
        </div>
      )}
    </div>
  );
};
