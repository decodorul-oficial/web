'use client';

import { generateMonitorulOficialUrl } from '@/lib/utils/monitorulOficial';
import { NewsItem } from '../types';

interface NewsViewStatsProps {
  news: NewsItem;
}

export function NewsViewStats({ news }: NewsViewStatsProps) {
  const formatViewCount = (count?: number): string => {
    if (!count) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Statistici</h3>
      <div className="rounded border p-4 text-sm text-gray-700 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Vizualizări:</span>
          <span className="font-medium text-brand-info">
            {formatViewCount(news.viewCount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Publicat la:</span>
          <span className="font-medium">
            {new Date(news.publicationDate).toLocaleDateString('ro-RO')}
          </span>
        </div>
        {news.createdAt && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Creat la:</span>
            <span className="font-medium">
              {new Date(news.createdAt).toLocaleDateString('ro-RO')}
            </span>
          </div>
        )}
        {news.updatedAt && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Actualizat la:</span>
            <span className="font-medium">
              {new Date(news.updatedAt).toLocaleDateString('ro-RO')}
            </span>
          </div>
        )}
        {news.filename && generateMonitorulOficialUrl(news.filename) && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-bold">Document oficial:</span>
            <span className="font-medium text-brand-info">
            <a 
                href={generateMonitorulOficialUrl(news.filename)!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-info hover:underline text-sm"
              >
                Monitorul Oficial →
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
