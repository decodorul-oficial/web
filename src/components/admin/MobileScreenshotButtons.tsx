'use client';

import { useMobileScreenshot } from '@/hooks/useMobileScreenshot';
import { NewsItem } from '@/features/news/types';

interface MobileScreenshotButtonsProps {
  news: NewsItem;
  className?: string;
}

export function MobileScreenshotButtons({ news, className = '' }: MobileScreenshotButtonsProps) {
  const { 
    isCapturing, 
    isSuccess, 
    error, 
    saveToDevice, 
    shareDirectly, 
    canShare, 
    isIOS, 
    isMobile 
  } = useMobileScreenshot({
    filename: `instagram-${news.id}`,
    quality: 1.0,
    scale: 2
  });

  const handleSaveToPhotos = async () => {
    const cardElement = document.querySelector('[data-screenshot-target]') as HTMLElement;
    if (!cardElement) {
      console.error('Screenshot target not found');
      return;
    }
    
    await saveToDevice(cardElement);
  };

  const handleShareDirectly = async () => {
    const cardElement = document.querySelector('[data-screenshot-target]') as HTMLElement;
    if (!cardElement) {
      console.error('Screenshot target not found');
      return;
    }
    
    await shareDirectly(cardElement, {
      title: 'Monitorul Oficial - Instagram Post',
      text: news.title,
    });
  };

  // Trigger the existing AutoScreenshot functionality as fallback
  const handleFallbackScreenshot = () => {
    const cardElement = document.querySelector('[data-screenshot-target]') as HTMLElement;
    if (cardElement) {
      cardElement.click();
    }
  };

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Primary Save Button - Optimized for iPhone */}
      <button
        onClick={handleSaveToPhotos}
        disabled={isCapturing}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-400 disabled:to-pink-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed text-lg"
      >
        <div className="flex items-center justify-center gap-3">
          {isCapturing ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Se procesează...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {isIOS ? 'Salvează în Photos' : isMobile ? 'Salvează în Galerie' : 'Salvează Imaginea'}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Share Button - Only show if Web Share API is supported */}
      {canShare && (
        <button
          onClick={handleShareDirectly}
          disabled={isCapturing}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2">
            {isCapturing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Se pregătește...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Partajează Direct</span>
              </>
            )}
          </div>
        </button>
      )}

      {/* Fallback Button - When Web Share is not available */}
      {!canShare && (
        <button
          onClick={handleFallbackScreenshot}
          disabled={isCapturing}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Imagine</span>
          </div>
        </button>
      )}

      {/* Success Message */}
      {isSuccess && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">
              {isIOS ? 'Imaginea a fost salvată în Photos!' : 'Imaginea a fost salvată!'}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Eroare: {error}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-gray-600 text-xs">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 font-medium">
            {isIOS && '📱 Optimizat pentru iPhone - imaginea se va salva automat în Photos'}
            {!isIOS && isMobile && '📱 Optimizat pentru mobil - imaginea se va salva în galerie'}
            {!isMobile && '💻 Click pentru a descărca imaginea'}
          </p>
          {isIOS && (
            <p className="text-blue-600 text-xs mt-1">
              Tip: După salvare, poți posta direct pe Instagram din Photos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
