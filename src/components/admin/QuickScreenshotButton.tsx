'use client';

import React, { useRef } from 'react';
import { NewsItem } from '@/features/news/types';
import { extractParteaFromFilename } from '@/lib/utils/monitorulOficial';
import { useMobileScreenshot } from '@/hooks/useMobileScreenshot';

interface QuickScreenshotButtonProps {
  news: NewsItem;
  compact?: boolean;
}

interface NewsContent {
  synthesis?: string;
  summary?: string;
  description?: string;
  category?: string;
  type?: string;
  monitorulOficial?: string;
  moNumberDate?: string;
}

export function QuickScreenshotButton({ news, compact = false }: QuickScreenshotButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isIOS } = useMobileScreenshot();

  // Extract synthesis from content if available
  const getSynthesis = () => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as NewsContent;
      return content.synthesis || content.summary || content.description || '';
    }
    return '';
  };

  const synthesis = getSynthesis();
  const truncatedSynthesis = synthesis.length > 200 
    ? synthesis.substring(0, 200) + '...' 
    : synthesis;

  // Extract category from content if available
  const getCategory = () => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as NewsContent;
      const rawCategory = content.category || content.type || '';
      return rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
    }
    return '';
  };

  const category = getCategory();
  const partea = extractParteaFromFilename(news.filename) || 'Partea I';

  // Extract publication date info for subtitle
  const getPublicationInfo = () => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as NewsContent;
      
      if (content.monitorulOficial && content.monitorulOficial.trim()) {
        return content.monitorulOficial.trim();
      }
      if (content.moNumberDate && content.moNumberDate.trim()) {
        return content.moNumberDate.trim();
      }
      
      if (news.publicationDate) {
        const date = new Date(news.publicationDate);
        return date.toLocaleDateString('ro-RO', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      }
    }
    return '';
  };

  const publicationInfo = getPublicationInfo();

  const handleQuickScreenshot = async () => {
    // Placeholder function - implement screenshot logic here
    console.log('Screenshot functionality not implemented');
  };

  return (
    <div className="relative">
      {/* Quick Screenshot Button */}
      <button
        onClick={handleQuickScreenshot}
        disabled={false} // isCapturing state removed
        className={`
          ${compact 
            ? 'w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-3 rounded-lg text-xs' 
            : 'w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg text-sm'
          }
          disabled:from-purple-400 disabled:to-pink-400 disabled:cursor-not-allowed
          transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100
          shadow-lg hover:shadow-xl
        `}
      >
        {false ? ( // isCapturing state removed
          <div className="flex items-center justify-center gap-2">
            <div className={`animate-spin rounded-full border-b-2 border-white ${compact ? 'h-3 w-3' : 'h-4 w-4'}`}></div>
            <span>{compact ? 'Salvez...' : 'Se salvează...'}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {compact 
                ? (isIOS ? '📱 Photos' : '💾 Salvează')
                : (isIOS ? 'Salvează în Photos' : 'Salvează Imaginea')
              }
            </span>
          </div>
        )}
      </button>

      {/* Success/Error Messages */}
      {false && ( // isSuccess state removed
        <div className="absolute -top-8 left-0 right-0 z-10">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded text-center">
            ✅ Salvat!
          </div>
        </div>
      )}

      {/* Hidden Instagram Card for Screenshot */}
      {false && (
        <div 
          ref={cardRef}
          className="fixed -top-[2000px] left-0 w-[400px] h-[400px] bg-white"
          style={{ zIndex: -1 }}
          data-screenshot-target
        >
          {/* Instagram Card Container - Hidden but rendered for screenshot */}
          <div className="relative w-full h-full bg-white rounded-2xl shadow-lg overflow-hidden">
            
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-accent to-brand-highlight opacity-90"></div>
            
            {/* Content Container */}
            <div className="relative h-full flex flex-col p-5 pb-12">
              
              {/* Header with Publication Info and Category */}
              <div className="flex justify-between items-start mb-4">
                {/* Publication Info */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-brand text-[10px] font-bold">📋</span>
                  </div>
                  <div className="text-white text-[10px] leading-tight min-w-0">
                    {publicationInfo ? (
                      <div>
                        <div className="font-semibold text-[10px] leading-tight">Monitorul Oficial</div>
                        <div className="text-white/80 text-[10px] leading-tight truncate">{publicationInfo}</div>
                      </div>
                    ) : (
                      <span className="font-semibold text-[10px] leading-tight">Monitorul Oficial</span>
                    )}
                  </div>
                </div>
                
                {/* Category Badge */}
                {category && (
                  <div className="bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2">
                    {category}
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col justify-center space-y-4 pb-8">
                {/* Title */}
                <h3 className="text-white text-base font-bold leading-tight line-clamp-3">
                  {news.title}
                </h3>
                
                {/* Synthesis */}
                {truncatedSynthesis && (
                  <p className="text-white/90 text-xs leading-relaxed line-clamp-3">
                    {truncatedSynthesis}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex items-center justify-between text-white/80 text-[10px]">
                  <span className="font-medium">SO: Monitorul Oficial {partea}</span>
                  <span className="font-medium">#1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
