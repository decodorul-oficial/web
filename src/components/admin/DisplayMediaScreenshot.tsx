'use client';

import { useState, useRef } from 'react';
import { NewsItem } from '@/features/news/types';
import { extractParteaFromFilename } from '@/lib/utils/monitorulOficial';
import { IOSScreenshotButton } from './IOSScreenshotButton';

interface DisplayMediaScreenshotProps {
  news: NewsItem;
  index: number;
}

export function DisplayMediaScreenshot({ news, index }: DisplayMediaScreenshotProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Check browser compatibility - exclude mobile devices
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isDisplayMediaSupported = !!(typeof window !== 'undefined' && navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices && !isMobile);

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
      const content = news.content as any;
      
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

  const captureDisplayMedia = async () => {
    setIsCapturing(true);
    setError(null);
    setCaptureSuccess(false);

    try {
      // Check if getDisplayMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('getDisplayMedia nu este suportat în acest browser. Încearcă să folosești un browser modern.');
      }

      // Show instructions to user
      setShowInstructions(true);

      // Request screen capture - user will select what to share
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      // Hide instructions
      setShowInstructions(false);

      // Create video element to capture the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.autoplay = true;

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = () => resolve(true);
      });

      // Create canvas to capture the video frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Nu s-a putut crea contextul canvas');
      }

      // Get the card element position and dimensions
      if (!cardRef.current) {
        throw new Error('Card-ul nu a fost găsit');
      }

      const cardRect = cardRef.current.getBoundingClientRect();
      
      // Check if the card is visible in the viewport
      if (cardRect.width === 0 || cardRect.height === 0) {
        throw new Error('Card-ul nu este vizibil în viewport. Asigură-te că este afișat pe ecran.');
      }
      
      // Set canvas dimensions to match the card size
      canvas.width = cardRect.width * 2; // 2x scale for better quality
      canvas.height = cardRect.height * 2;

      // Calculate the position of the card in the video stream
      // We need to map the card position to the video coordinates
      
      // Calculate scaling factors based on the actual screen dimensions
      const scaleX = video.videoWidth / window.innerWidth;
      const scaleY = video.videoHeight / window.innerHeight;
      
      // Calculate the card position in video coordinates
      const cardX = Math.round(cardRect.left * scaleX);
      const cardY = Math.round(cardRect.top * scaleY);
      const cardWidth = Math.round(cardRect.width * scaleX);
      const cardHeight = Math.round(cardRect.height * scaleY);
      
      // Ensure we don't go out of bounds
      const maxX = Math.max(0, Math.min(cardX, video.videoWidth - cardWidth));
      const maxY = Math.max(0, Math.min(cardY, video.videoHeight - cardHeight));
      const maxWidth = Math.min(cardWidth, video.videoWidth - maxX);
      const maxHeight = Math.min(cardHeight, video.videoHeight - maxY);
      
      // Debug logging (remove in production)
      console.log('Card capture debug:', {
        cardRect: { left: cardRect.left, top: cardRect.top, width: cardRect.width, height: cardRect.height },
        video: { width: video.videoWidth, height: video.videoHeight },
        screen: { width: window.innerWidth, height: window.innerHeight },
        scale: { x: scaleX, y: scaleY },
        calculated: { x: cardX, y: cardY, width: cardWidth, height: cardHeight },
        final: { x: maxX, y: maxY, width: maxWidth, height: maxHeight }
      });

      // Draw only the card portion from the video to the canvas
      ctx.drawImage(
        video,
        maxX, maxY, maxWidth, maxHeight,      // Source rectangle (from video)
        0, 0, canvas.width, canvas.height     // Destination rectangle (to canvas)
      );

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Nu s-a putut crea blob-ul pentru imagine');
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `instagram-card-${news.id}-${new Date().toISOString().slice(0, 10)}.png`;
        
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
      console.error('Display media capture failed:', error);
      
      // Provide more helpful error messages
      let errorMessage = 'Eroare necunoscută';
      if (error instanceof Error) {
        if (error.message.includes('Permission denied')) {
          errorMessage = 'Permisiunea a fost refuzată. Încearcă din nou și selectează ce vrei să capturezi.';
        } else if (error.message.includes('getDisplayMedia')) {
          errorMessage = 'Browser-ul nu suportă capturarea ecranului. Încearcă Chrome, Firefox sau Edge.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setIsCapturing(false);
      setShowInstructions(false);
    }
  };

  const openPreview = () => {
    // Open in new tab for preview
    const url = `/admin/instagram/preview/${news.id}`;
    window.open(url, '_blank');
  };

  return (
    <div className="group">
      {/* Instagram Card Container */}
      <div 
        ref={cardRef}
        className="relative w-full aspect-square bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-accent to-brand-highlight opacity-90"></div>
        
        {/* Content Container */}
        <div className="relative h-full flex flex-col p-5 pb-12">
          
          {/* Header with Publication Info and Category */}
          <div className="flex justify-between items-start mb-4">
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
              <span className="font-medium">#{index + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Screenshot Button - Simplified and reliable */}
      <div className="mt-3">
        <IOSScreenshotButton news={news} compact={true} />
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2">
        {!isMobile && (
          <>
            <button
              onClick={captureDisplayMedia}
              disabled={isCapturing || !isDisplayMediaSupported}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDisplayMediaSupported 
                  ? 'bg-brand-accent hover:bg-brand-highlight text-white' 
                  : 'bg-gray-400 cursor-not-allowed text-gray-200'
              } disabled:opacity-50`}
              title={!isDisplayMediaSupported ? 'Browser-ul nu suportă capturarea ecranului' : ''}
              aria-label={isDisplayMediaSupported ? 'Capturare screenshot folosind getDisplayMedia' : 'Capturarea ecranului nu este suportată'}
            >
              {isCapturing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Se capturează...
                </div>
              ) : !isDisplayMediaSupported ? (
                '❌ Nu suportat'
              ) : (
                '🖥️ Capture Display'
              )}
            </button>
            
            <button
              onClick={() => setShowInstructions(true)}
              className="bg-brand-soft hover:bg-brand-highlight text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              aria-label="Afișează instrucțiunile pentru capturarea ecranului"
            >
              📖 Instrucțiuni
            </button>
          </>
        )}
        
        {isMobile && (
          <div className="flex-1 bg-blue-500/20 border border-blue-300 text-blue-700 px-3 py-2 rounded-lg text-sm text-center">
            📱 Folosește butonul violet de sus pentru screenshot pe mobil
          </div>
        )}
        
        <button
          onClick={openPreview}
          className="flex-1 bg-brand-info hover:bg-brand-highlight text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          aria-label="Deschide preview-ul știrii în tab nou"
        >
          👁️ Preview
        </button>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              📱 Capturare Ecran
            </h3>
            <div className="space-y-3 text-gray-600">
              <p>1. Selectează ce vrei să capturezi:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Entire screen</strong> - pentru tot ecranul (recomandat)</li>
                <li><strong>Application window</strong> - pentru fereastra browser-ului</li>
                <li><strong>Browser tab</strong> - pentru tab-ul curent</li>
              </ul>
              <p>2. Apasă <strong>"Share"</strong> pentru a începe capturarea</p>
              <p>3. Se va captura <strong>doar card-ul știrii</strong>, nu tot ecranul</p>
              <p>4. Imaginea va fi descărcată automat cu numele <code>instagram-card-[ID].png</code></p>
              <p className="text-sm text-gray-500 mt-2">
                💡 <strong>Important:</strong> Asigură-te că card-ul este vizibil pe ecran înainte de capturare
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowInstructions(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Închide
              </button>
              </div>
            </div>
          </div>
        )}

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

      {/* Error message */}
      {error && (
        <div className="mt-2 text-center">
          <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-3 py-2 rounded-lg text-sm">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Card Info */}
      <div className="mt-2 text-center">
        <p className="text-white/80 text-xs">
          {news.publicationDate ? new Date(news.publicationDate).toLocaleDateString('ro-RO') : 'Data indisponibilă'}
        </p>
        {isMobile ? (
          <p className="text-white/60 text-xs mt-1">
            📱 Folosește butonul violet pentru screenshot direct în Photos
          </p>
        ) : (
          <>
            <p className="text-white/60 text-xs mt-1">
              💡 Folosește "Capture Display" pentru a captura doar card-ul știrii folosind getDisplayMedia
            </p>
            {!isDisplayMediaSupported && (
              <p className="text-red-300 text-xs mt-1">
                ⚠️ Browser-ul nu suportă capturarea ecranului. Încearcă Chrome, Firefox sau Edge.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
