'use client';

import { useState } from 'react';
import Image from 'next/image';
import { NewsItem } from '@/features/news/types';

interface InstagramCardProps {
  news: NewsItem;
  index: number;
}

export function InstagramCard({ news, index }: InstagramCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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
  const truncatedSynthesis = synthesis.length > 200 
    ? synthesis.substring(0, 200) + '...' 
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

  const handleCardClick = () => {
    // Open in new tab for screenshot
    const url = `/admin/instagram/preview/${news.id}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Instagram Card Container - 1:1 Aspect Ratio */}
      <div className="relative w-full aspect-square bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-accent to-brand-highlight opacity-90"></div>
        
        {/* Content Container */}
        <div className="relative h-full flex flex-col p-6">
          
          {/* Header with Logo and Category */}
          <div className="flex justify-between items-start mb-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Image 
                  src="/logo.png" 
                  alt="Decodorul Oficial" 
                  width={24} 
                  height={24} 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="text-white text-sm font-semibold">Decodorul Oficial</span>
            </div>
            
            {/* Category Badge */}
            {category && (
              <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                {category}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Title */}
            <h3 className="text-white text-lg font-bold leading-tight mb-3 line-clamp-3">
              {news.title}
            </h3>
            
            {/* Synthesis */}
            {truncatedSynthesis && (
              <p className="text-white/90 text-sm leading-relaxed line-clamp-4">
                {truncatedSynthesis}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-white/70 text-xs">
              <span>📋 Monitorul Oficial</span>
              <span>#{index + 1}</span>
            </div>
          </div>

          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white/90 text-brand px-4 py-2 rounded-lg font-medium text-sm">
                Click pentru screenshot
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Info */}
      <div className="mt-2 text-center">
        <p className="text-white/80 text-xs">
          {news.publicationDate ? new Date(news.publicationDate).toLocaleDateString('ro-RO') : 'Data indisponibilă'}
        </p>
      </div>
    </div>
  );
}
