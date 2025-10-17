'use client';

import { useState, useRef } from 'react';
import { NewsItem } from '@/features/news/types';
import { extractParteaFromFilename } from '@/lib/utils/monitorulOficial';
import { IOSScreenshotButton } from './IOSScreenshotButton';
import { useIOSScreenshot } from '@/hooks/useIOSScreenshot';
import * as LucideIcons from 'lucide-react';

interface DisplayMediaScreenshotProps {
  news: NewsItem;
  index: number;
}

// Define proper types for the content object
interface NewsContent {
  synthesis?: string;
  summary?: string;
  description?: string;
  category?: string;
  type?: string;
  monitorulOficial?: string;
  moNumberDate?: string;
  author?: string;
}

export function DisplayMediaScreenshot({ news, index }: DisplayMediaScreenshotProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use the iOS screenshot hook for the main screenshot functionality
  const { 
    isCapturing: isIOSScreenshotCapturing, 
    isSuccess: isIOSScreenshotSuccess, 
    error: iosscreenshotError, 
    captureAndDownload,
    isIOS 
  } = useIOSScreenshot();


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

  // Extract partea from filename
  const partea = extractParteaFromFilename(news.filename) || 'Partea I';

  // Extract publication date info
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

  // Extract author from content and truncate after 12 characters
  const getAuthor = () => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as NewsContent;
      const author = content.author || 'Monitorul Oficial';
      return author.length > 100 ? author.substring(0, 100) + '...' : author;
    }
    return 'Monitorul Oficial';
  };

  const author = getAuthor();

  // Handle main screenshot using iOS screenshot hook
  const handleMainScreenshot = async () => {
    const cardElement = document.querySelector(`[data-screenshot-target="${news.id}"]`) as HTMLElement;
    if (!cardElement) {
      console.error('Screenshot target not found');
      return;
    }
    
    await captureAndDownload(cardElement, `instagram-${news.id}`);
  };


  const openPreview = () => {
    // Open in new tab for preview
    const url = `/admin/instagram/preview/${news.id}`;
    window.open(url, '_blank');
  };

  return (
    <div className="group">
      {/* Publication Date - Outside the card so it doesn't appear in screenshots */}
      <div className="mt-2 text-center">
        <span className="text-gray-700 text-xs">
          📅 {news.publicationDate ? new Date(news.publicationDate).toLocaleDateString('ro-RO', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          }) : 'Data indisponibilă'}
        </span>
      </div>
      {/* Instagram Card Container */}
      <div 
        ref={cardRef}
        data-screenshot-target={news.id}
        className="relative w-full aspect-square bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-accent to-brand-highlight"></div>
        
        {/* Content Container */}
        <div className="relative h-full flex flex-col px-10 py-4">
          
          {/* Header - Simplified */}
          <div className="flex justify-between items-center mb-0">
            <div className="text-white text-xs font-bold" style={{ fontSize: '0.65rem' }}>
            {(() => {
                  try {
                    // Import all Lucide icons as components
                    const icons = LucideIcons;
                    const iconName = typeof news.content === 'object' && news.content && 'lucide_icon' in news.content
                      ? (news.content as any).lucide_icon
                      : null;
                    if (iconName) {
                      // Convert kebab-case to PascalCase, e.g. 'building-2' -> 'Building2'
                      const pascalCase = iconName
                        .split('-')
                        .map((part: string, idx: number) =>
                          idx === 0
                            ? part.charAt(0).toUpperCase() + part.slice(1)
                            : part.charAt(0).toUpperCase() + part.slice(1)
                        )
                        .join('');
                      const LucideIcon = (icons as any)[pascalCase];
                      if (LucideIcon) {
                        return <LucideIcon size={18} className="text-white" />;
                      }
                    }
                  } catch (e) {
                    // fallback
                  }
                  // fallback to text if icon not found
                  return (
                    <span className="text-white/70 text-xs">
                      {typeof news.content === 'object' && news.content && 'lucide_icon' in news.content
                        ? (news.content as any).lucide_icon
                        : ''}
                    </span>
                  );
                })()}
                
            </div>
            {category && (
              <span className="bg-white/20 text-white text-xs px-2 pt-0 pb-3 rounded-full" style={{ fontSize: '0.65rem' }}>
                {category}
              </span>
            )}
          </div>

          {/* Main Content - Title Only */}
          <div className="flex-1 flex items-center justify-center px-0">
            <h3 className="text-white text-sm font-bold leading-tight text-center break-words">
              {news.title}
            </h3>
          </div>

          {/* Footer - Simplified */}
          <div className="mt-4 pt-2 border-t border-white/30">
            <div className="flex items-center justify-between text-white/80 text-xs" style={{ fontSize: '0.65rem' }}>
              <span className="text-[10px] break-words whitespace-pre-line max-w-[180px] block leading-tight">
                {author}
              </span>
              {/* Render Lucide icon if available */}
              <span className="bg-white/20 px-2 py-2 rounded-full flex items-center justify-center">
                {(() => {
                  try {
                    // Import all Lucide icons as components
                    const icons = LucideIcons;
                    const iconName = typeof news.content === 'object' && news.content && 'lucide_icon' in news.content
                      ? (news.content as any).lucide_icon
                      : null;
                    if (iconName) {
                      // Convert kebab-case to PascalCase, e.g. 'building-2' -> 'Building2'
                      const pascalCase = iconName
                        .split('-')
                        .map((part: string, idx: number) =>
                          idx === 0
                            ? part.charAt(0).toUpperCase() + part.slice(1)
                            : part.charAt(0).toUpperCase() + part.slice(1)
                        )
                        .join('');
                      const LucideIcon = (icons as any)[pascalCase];
                      if (LucideIcon) {
                        return <LucideIcon size={18} className="text-white" />;
                      }
                    }
                  } catch (e) {
                    // fallback
                  }
                  // fallback to text if icon not found
                  return (
                    <span className="text-white/70 text-xs" style={{ fontSize: '0.6rem' }}>
                      {typeof news.content === 'object' && news.content && 'lucide_icon' in news.content
                        ? (news.content as any).lucide_icon
                        : ''}
                    </span>
                  );
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Screenshot Button - Using iOS screenshot hook */}
      <div className="mt-3">
        <button
          onClick={handleMainScreenshot}
          disabled={isIOSScreenshotCapturing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-400 disabled:to-pink-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed text-sm"
        >
          <div className="flex items-center justify-center gap-2">
            {isIOSScreenshotCapturing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Se salvează...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>📱 Salvează</span>
              </>
            )}
          </div>
        </button>

        {/* Status Messages - Main Screenshot */}
        {isIOSScreenshotSuccess && (
          <div className="mt-2 bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded text-xs">
            ✅ Salvat în {isIOS ? 'Photos' : 'galerie'}!
          </div>
        )}

        {iosscreenshotError && (
          <div className="mt-2 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-xs">
            ❌ Eroare: {iosscreenshotError}
          </div>
        )}
      </div>

      {/* Preview Button */}
      <div className="mt-3">
        <button
          onClick={openPreview}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          aria-label="Deschide preview-ul știrii în tab nou"
        >
          👁️ Preview
        </button>
      </div>

    </div>
  );
}
