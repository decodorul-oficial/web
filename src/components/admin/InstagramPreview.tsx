'use client';

import Image from 'next/image';
import { NewsItem } from '@/features/news/types';
import { HashtagSection } from './HashtagSection';

interface InstagramPreviewProps {
  news: NewsItem;
}

export function InstagramPreview({ news }: InstagramPreviewProps) {
  // Extract synthesis from content if available
  const getSynthesis = () => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as any;
      return content.synthesis || content.summary || content.description || '';
    }
    return '';
  };

  const synthesis = getSynthesis();
  
  // Truncate synthesis to fit the card
  const truncatedSynthesis = synthesis.length > 300 
    ? synthesis.substring(0, 300) + '...' 
    : synthesis;

  // Extract category from content if available
  const getCategory = () => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as any;
      const rawCategory = content.category || content.type || '';
      // Capitalize first letter
      return rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
    }
    return '';
  };

  const category = getCategory();

  return (
    <div className="w-full">
      {/* Instagram Card - Optimized for Screenshot */}
      <div className="relative w-full aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-accent to-brand-highlight opacity-95"></div>
        
        {/* Content Container */}
        <div className="relative h-full flex flex-col p-8">
          
          {/* Header with Logo and Category */}
          <div className="flex justify-between items-start mb-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Image 
                  src="/logo.png" 
                  alt="Decodorul Oficial" 
                  width={28} 
                  height={28} 
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-white text-base font-bold">Decodorul Oficial</span>
            </div>
            
            {/* Category Badge */}
            {category && (
              <div className="bg-white/25 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full font-semibold">
                {category}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Title */}
            <h1 className="text-white text-2xl font-bold leading-tight mb-4 line-clamp-3">
              {news.title}
            </h1>
            
            {/* Synthesis */}
            {truncatedSynthesis && (
              <p className="text-white/95 text-base leading-relaxed line-clamp-5">
                {truncatedSynthesis}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/25">
            <div className="flex items-center justify-between text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <span className="font-medium">Monitorul Oficial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Publicat:</span>
                <span className="font-medium">
                  {news.publicationDate ? new Date(news.publicationDate).toLocaleDateString('ro-RO') : 'Data indisponibilă'}
                </span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-8 left-4 w-8 h-8 bg-white/10 rounded-full"></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => window.print()}
          className="bg-brand-info hover:bg-brand-highlight text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          🖨️ Print
        </button>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          ← Înapoi
        </button>
      </div>

      {/* Hashtag Section */}
      <HashtagSection news={news} />
    </div>
  );
}
