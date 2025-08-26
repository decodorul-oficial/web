'use client';

import Image from 'next/image';
import { NewsItem } from '@/features/news/types';
import { HashtagSection } from './HashtagSection';
import { AutoScreenshot } from './AutoScreenshot';

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
  const truncatedSynthesis = synthesis.length > 250 
    ? synthesis.substring(0, 250) + '...' 
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
    <div className="w-full max-w-md mx-auto">
      {/* Instagram Card - Optimized for Screenshot */}
      <AutoScreenshot filename={`instagram-${news.id}`}>
        <div className="relative w-full aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-accent to-brand-highlight opacity-95"></div>
        
        {/* Content Container */}
        <div className="relative h-full flex flex-col p-5 sm:p-6">
          
          {/* Header with Logo and Category */}
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="Decodorul Oficial" 
                  width={28} 
                  height={28} 
                  className="w-5 h-5 sm:w-7 sm:h-7 object-contain"
                />
              </div>
              <span className="text-white text-sm sm:text-base font-bold leading-none">Decodorul Oficial</span>
            </div>
            
            {/* Category Badge */}
            {category && (
              <div className="bg-white/25 backdrop-blur-sm text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold flex-shrink-0">
                {category}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Title */}
            <h1 className="text-white text-lg sm:text-xl font-bold leading-tight mb-3 line-clamp-3">
              {news.title}
            </h1>
            
            {/* Synthesis */}
            {truncatedSynthesis && (
              <p className="text-white/95 text-sm leading-relaxed line-clamp-4">
                {truncatedSynthesis}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/25">
            <div className="flex items-center justify-between text-white/80 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-base">📋</span>
                <span className="font-medium">Monitorul Oficial</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">Publicat:</span>
                <span className="font-medium text-xs">
                  {news.publicationDate ? new Date(news.publicationDate).toLocaleDateString('ro-RO') : 'Data indisponibilă'}
                </span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-8 h-8 sm:w-12 sm:h-12 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-2 sm:bottom-4 left-1 sm:left-2 w-4 h-4 sm:w-6 sm:h-6 bg-white/10 rounded-full"></div>
        </div>
        </div>
      </AutoScreenshot>

      {/* Back Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => window.history.back()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
        >
          ← Înapoi la lista de știri
        </button>
      </div>

      {/* Hashtag Section */}
      <HashtagSection news={news} />
    </div>
  );
}
