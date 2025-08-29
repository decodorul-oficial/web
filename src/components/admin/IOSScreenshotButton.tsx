'use client';

import { useIOSScreenshot } from '@/hooks/useIOSScreenshot';
import { NewsItem } from '@/features/news/types';

interface IOSScreenshotButtonProps {
  news: NewsItem;
  className?: string;
  compact?: boolean;
}

export function IOSScreenshotButton({ news, className = '', compact = false }: IOSScreenshotButtonProps) {
  const { 
    isCapturing, 
    isSuccess, 
    error, 
    captureAndDownload,
    isIOS 
  } = useIOSScreenshot();

  const handleScreenshot = async () => {
    const cardElement = document.querySelector('[data-screenshot-target]') as HTMLElement;
    if (!cardElement) {
      console.error('Screenshot target not found');
      return;
    }
    
    await captureAndDownload(cardElement, `instagram-${news.id}`);
  };

  if (compact) {
    return (
      <div className={`w-full ${className}`}>
        <button
          onClick={handleScreenshot}
          disabled={isCapturing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-400 disabled:to-pink-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed text-sm"
        >
          <div className="flex items-center justify-center gap-2">
            {isCapturing ? (
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

        {/* Status Messages - Compact */}
        {isSuccess && (
          <div className="mt-2 bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded text-xs">
            ✅ Salvat în {isIOS ? 'Photos' : 'galerie'}!
          </div>
        )}

        {error && (
          <div className="mt-2 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-xs">
            ❌ Eroare: {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Main Screenshot Button */}
      <button
        onClick={handleScreenshot}
        disabled={isCapturing}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-400 disabled:to-pink-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed text-lg"
      >
        <div className="flex items-center justify-center gap-3">
          {isCapturing ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Se salvează imaginea...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                📱 Salvează în {isIOS ? 'Photos' : 'Galerie'}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Success Message */}
      {isSuccess && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">
              Imaginea a fost salvată în {isIOS ? 'Photos' : 'galerie'}!
            </span>
          </div>
          {isIOS && (
            <p className="text-green-600 text-sm mt-1">
              💡 Poți acum să postezi direct pe Instagram din Photos
            </p>
          )}
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
            📱 Simplificat pentru iPhone - click pentru descărcare directă
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Workflow: Salvează → Mergi la Photos → Postează pe Instagram
          </p>
        </div>
      </div>
    </div>
  );
}
