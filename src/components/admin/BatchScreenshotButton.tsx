'use client';

import React, { useState } from 'react';
import { NewsItem } from '@/features/news/types';
import html2canvas from 'html2canvas';

interface BatchScreenshotButtonProps {
  news: NewsItem[];
  filterToday?: boolean;
}

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

export function BatchScreenshotButton({ news, filterToday = true }: BatchScreenshotButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; total: number }>({
    success: 0,
    failed: 0,
    total: 0
  });

  // Simple iOS detection without hook
  const isIOS = typeof window !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  
  // Use the same capture logic as the individual "Salvează" button
  // This matches the logic from useIOSScreenshot hook
  const captureAndDownload = async (element: HTMLElement, filename: string = 'instagram-post') => {
    try {
      // Wait a bit for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Wait for fonts if available
      if ('fonts' in document) {
        try {
          await document.fonts.ready;
        } catch (error) {
          console.warn('Font loading failed:', error);
        }
      }

      // Create canvas with high quality settings - same as useIOSScreenshot
      const canvas = await html2canvas(element, {
        backgroundColor: '#0B132B',
        scale: window.devicePixelRatio || 2, // Use device pixel ratio
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        imageTimeout: 10000,
        foreignObjectRendering: false, // Better mobile compatibility
        removeContainer: true,
        ignoreElements: (el) => {
          // Ignore loading spinners and animations
          return el.classList.contains('animate-spin') || 
                 el.classList.contains('transition-') ||
                 el.getAttribute('data-ignore-screenshot') === 'true';
        }
      });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png', 1.0);
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const finalFilename = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      link.style.display = 'none';
      
      // Add to DOM and click
      document.body.appendChild(link);
      
      // For iOS, add a small delay and ensure the click happens properly
      if (isIOS) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create a user event to trigger download
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        link.dispatchEvent(event);
      } else {
        link.click();
      }
      
      // Clean up after a delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Screenshot failed:', error);
      return false;
    }
  };

  // Filter news for today if requested
  const getFilteredNews = () => {
    if (!filterToday) return news;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const filtered = news.filter(item => {
      if (!item.publicationDate) return false;
      const itemDate = new Date(item.publicationDate);
      const itemDateStr = itemDate.toISOString().split('T')[0];
      return itemDateStr === todayStr;
    });
    return filtered;
  };

  const handleBatchScreenshot = async () => {
    try {
      const filteredNews = getFilteredNews();
      
      if (filteredNews.length === 0) {
        alert('Nu există știri pentru ziua curentă!');
        return;
      }

      if (!confirm(`Vrei să salvezi ${filteredNews.length} știri din ziua curentă? Acest proces poate dura câteva minute.`)) {
        return;
      }

      setIsProcessing(true);
      setCurrentIndex(0);
      setResults({ success: 0, failed: 0, total: filteredNews.length });

      let successCount = 0;
      let failedCount = 0;

      // Simulate clicking each individual "Salvează" button
      // by finding the card element and using the same capture logic
      for (let i = 0; i < filteredNews.length; i++) {
        setCurrentIndex(i + 1);
        
        const newsItem = filteredNews[i];
        
        // Find the actual card element on the page (same as individual button does)
        const cardElement = document.querySelector(`[data-screenshot-target="${newsItem.id}"]`) as HTMLElement;
        
        if (!cardElement) {
          console.warn(`Card element not found for news ${newsItem.id}`);
          failedCount++;
          setResults(prev => ({
            ...prev,
            failed: failedCount
          }));
          continue;
        }
        
        // Use the same capture logic as the individual "Salvează" button
        const success = await captureAndDownload(cardElement, `instagram-${newsItem.id}`);
        
        if (success) {
          successCount++;
        } else {
          failedCount++;
        }
        
        setResults(prev => ({
          ...prev,
          success: successCount,
          failed: failedCount
        }));

        // Small delay between screenshots to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setIsProcessing(false);
      alert(`Proces finalizat! Succes: ${successCount}, Eșuate: ${failedCount}`);
    } catch (error) {
      console.error('❌ Error in handleBatchScreenshot:', error);
      setIsProcessing(false);
      alert(`Eroare: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`);
    }
  };

  const filteredNews = getFilteredNews();
  const todayCount = filteredNews.length;

  const handleAllScreenshots = async () => {
    if (news.length === 0) {
      alert('Nu există știri disponibile!');
      return;
    }
    
    if (!confirm(`Vrei să salvezi toate ${news.length} știri? Acest proces poate dura câteva minute.`)) {
      return;
    }

    setIsProcessing(true);
    setCurrentIndex(0);
    setResults({ success: 0, failed: 0, total: news.length });

    let successCount = 0;
    let failedCount = 0;

    // Simulate clicking each individual "Salvează" button
    // by finding the card element and using the same capture logic
    for (let i = 0; i < news.length; i++) {
      setCurrentIndex(i + 1);
      
      const newsItem = news[i];
      
      // Find the actual card element on the page (same as individual button does)
      const cardElement = document.querySelector(`[data-screenshot-target="${newsItem.id}"]`) as HTMLElement;
      
      if (!cardElement) {
        console.warn(`Card element not found for news ${newsItem.id}`);
        failedCount++;
        setResults(prev => ({
          ...prev,
          failed: failedCount
        }));
        continue;
      }
      
      // Use the same capture logic as the individual "Salvează" button
      const success = await captureAndDownload(cardElement, `instagram-${newsItem.id}`);
      
      if (success) {
        successCount++;
      } else {
        failedCount++;
      }
      
      setResults(prev => ({
        ...prev,
        success: successCount,
        failed: failedCount
      }));

      // Small delay between screenshots to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsProcessing(false);
    alert(`Proces finalizat! Succes: ${successCount}, Eșuate: ${failedCount}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Today's News Button */}
      <button
        onClick={handleBatchScreenshot}
        disabled={isProcessing || todayCount === 0}
        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-green-400 disabled:to-emerald-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Procesez {currentIndex}/{results.total}...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              📅 Salvează {todayCount} știri din azi {isIOS ? 'în Photos' : ''}
              {todayCount === 0 ? ' (niciuna găsită)' : ''}
            </span>
          </div>
        )}
      </button>

      {/* All News Button */}
      <button
        onClick={handleAllScreenshots}
        disabled={isProcessing || news.length === 0}
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-blue-400 disabled:to-purple-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Procesez toate...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>
              📸 Salvează toate {news.length} știri {isIOS ? 'în Photos' : ''}
            </span>
          </div>
        )}
      </button>

      {/* Progress indicator */}
      {isProcessing && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Progres</span>
            <span>{currentIndex}/{results.total}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentIndex / results.total) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-white/80 text-xs mt-1">
            <span>✅ Succes: {results.success}</span>
            <span>❌ Eșuate: {results.failed}</span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-gray-700 text-xs text-center">
        {filterToday 
          ? `${todayCount} știri din ziua curentă găsite`
          : `${todayCount} știri disponibile`
        }
      </div>
    </div>
  );
}
