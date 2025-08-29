'use client';

import { useState, useRef } from 'react';
import { NewsItem } from '@/features/news/types';
import { extractParteaFromFilename } from '@/lib/utils/monitorulOficial';
import html2canvas from 'html2canvas';

interface InstagramCardProps {
  news: NewsItem;
  index: number;
}

export function InstagramCard({ news, index }: InstagramCardProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Extract synthesis from content if available
  const getSynthesis = () => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as any;
      return content.synthesis || content.summary || content.description || '';
    }
    return '';
  };

  const synthesis = getSynthesis();
  
  // Truncate synthesis to fit the card - optimized for screenshot
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

  // Extract partea from filename
  const partea = extractParteaFromFilename(news.filename) || 'Partea I';

  // Extract publication date info for subtitle - NO redundant title info
  const getPublicationInfo = () => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as any;
      
      // Try to get specific publication info
      if (content.monitorulOficial && content.monitorulOficial.trim()) {
        return content.monitorulOficial.trim();
      }
      if (content.moNumberDate && content.moNumberDate.trim()) {
        return content.moNumberDate.trim();
      }
      
      // Fallback to publication date
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

  const captureScreenshot = async () => {
    if (!cardRef.current) return;

    setIsCapturing(true);
    setCaptureSuccess(false);

    try {
      // Wait a bit for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the card
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0B132B',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        imageTimeout: 15000,
        ignoreElements: (element) => {
          return element.classList.contains('animate-spin');
        }
      });

      // Convert canvas to blob with higher quality
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          setIsCapturing(false);
          return;
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `instagram-${news.id}-${new Date().toISOString().slice(0, 10)}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        setCaptureSuccess(true);
        setIsCapturing(false);
        
        // Reset success message after 3 seconds
        setTimeout(() => setCaptureSuccess(false), 3000);
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Screenshot failed:', error);
      setIsCapturing(false);
    }
  };

  const openPreview = () => {
    // Open in new tab for preview
    const url = `/admin/instagram/preview/${news.id}`;
    window.open(url, '_blank');
  };

  return (
    <div className="group">
      {/* Instagram Card Container - 1:1 Aspect Ratio - Optimized for screenshot */}
      <div 
        ref={cardRef}
        className="relative w-full aspect-square bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-accent to-brand-highlight opacity-90"></div>
        
        {/* Content Container - Optimized spacing for screenshot with bottom padding */}
        <div className="relative h-full flex flex-col p-5 pb-12">
          
          {/* Header with Publication Info and Category - NO redundant title */}
          <div className="flex justify-between items-start mb-4">
            {/* Publication Info instead of redundant title */}
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

          {/* Main Content - Optimized for screenshot with proper bottom padding */}
          <div className="flex-1 flex flex-col justify-center space-y-4 pb-8">
            {/* Title - Smaller font to prevent clipping */}
            <h3 className="text-white text-base font-bold leading-tight line-clamp-3">
              {news.title}
            </h3>
            
            {/* Synthesis - Smaller font to prevent clipping */}
            {truncatedSynthesis && (
              <p className="text-white/90 text-xs leading-relaxed line-clamp-3">
                {truncatedSynthesis}
              </p>
            )}
          </div>

          {/* Footer - Optimized spacing */}
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between text-white/80 text-[10px]">
              <span className="font-medium">SO: Monitorul Oficial {partea}</span>
              <span className="font-medium">#{index + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={captureScreenshot}
          disabled={isCapturing}
          className="flex-1 bg-brand-accent hover:bg-brand-highlight text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isCapturing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Se salvează...
            </div>
          ) : (
            '📸 Screenshot'
          )}
        </button>
        
        <button
          onClick={openPreview}
          className="flex-1 bg-brand-info hover:bg-brand-highlight text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          👁️ Preview
        </button>
      </div>

      {/* Success message */}
      {captureSuccess && (
        <div className="mt-2 text-center">
          <div className="bg-green-500/20 border border-green-500/30 text-green-100 px-3 py-2 rounded-lg text-sm">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Screenshot salvat!</span>
            </div>
          </div>
        </div>
      )}

      {/* Card Info */}
      <div className="mt-2 text-center">
        <p className="text-white/80 text-xs">
          {news.publicationDate ? new Date(news.publicationDate).toLocaleDateString('ro-RO') : 'Data indisponibilă'}
        </p>
      </div>
    </div>
  );
}
