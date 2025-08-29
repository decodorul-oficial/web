'use client';

import { useState } from 'react';
import { NewsItem } from '@/features/news/types';
import { useMobileScreenshot } from '@/hooks/useMobileScreenshot';
import { extractParteaFromFilename } from '@/lib/utils/monitorulOficial';

interface BatchScreenshotButtonProps {
  news: NewsItem[];
  filterToday?: boolean;
}

export function BatchScreenshotButton({ news, filterToday = true }: BatchScreenshotButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; total: number }>({
    success: 0,
    failed: 0,
    total: 0
  });

  const { isIOS } = useMobileScreenshot();

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

  const generateCardHTML = (newsItem: NewsItem, index: number) => {
    // Extract synthesis
    const getSynthesis = () => {
      if (typeof newsItem.content === 'object' && newsItem.content !== null) {
        const content = newsItem.content as any;
        return content.synthesis || content.summary || content.description || '';
      }
      return '';
    };

    const synthesis = getSynthesis();
    const truncatedSynthesis = synthesis.length > 200 
      ? synthesis.substring(0, 200) + '...' 
      : synthesis;

    // Extract category
    const getCategory = () => {
      if (typeof newsItem.content === 'object' && newsItem.content !== null) {
        const content = newsItem.content as any;
        const rawCategory = content.category || content.type || '';
        return rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
      }
      return '';
    };

    const category = getCategory();
    const partea = extractParteaFromFilename(newsItem.filename) || 'Partea I';

    // Extract publication info
    const getPublicationInfo = () => {
      if (typeof newsItem.content === 'object' && newsItem.content !== null) {
        const content = newsItem.content as any;
        
        if (content.monitorulOficial && content.monitorulOficial.trim()) {
          return content.monitorulOficial.trim();
        }
        if (content.moNumberDate && content.moNumberDate.trim()) {
          return content.moNumberDate.trim();
        }
        
        if (newsItem.publicationDate) {
          const date = new Date(newsItem.publicationDate);
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

    return `
      <div style="
        position: relative;
        width: 400px;
        height: 400px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        
        <!-- Background Gradient -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #3A506B 100%);
          opacity: 0.95;
        "></div>
        
        <!-- Content Container -->
        <div style="
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 20px;
          padding-bottom: 48px;
        ">
          
          <!-- Header -->
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          ">
            <!-- Publication Info -->
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              flex: 1;
              min-width: 0;
            ">
              <div style="
                width: 28px;
                height: 28px;
                background-color: white;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                flex-shrink: 0;
              ">
                <span style="color: #0B132B; font-size: 10px; font-weight: bold;">📋</span>
              </div>
              <div style="
                color: white;
                font-size: 10px;
                line-height: 1.2;
                min-width: 0;
              ">
                ${publicationInfo ? `
                  <div style="font-weight: 600; margin-bottom: 2px;">Monitorul Oficial</div>
                  <div style="color: rgba(255, 255, 255, 0.8); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${publicationInfo}</div>
                ` : `
                  <span style="font-weight: 600;">Monitorul Oficial</span>
                `}
              </div>
            </div>
            
            <!-- Category Badge -->
            ${category ? `
              <div style="
                background-color: rgba(255, 255, 255, 0.25);
                color: white;
                font-size: 10px;
                padding: 4px 8px;
                border-radius: 20px;
                font-weight: 600;
                flex-shrink: 0;
                margin-left: 8px;
              ">${category}</div>
            ` : ''}
          </div>

          <!-- Main Content -->
          <div style="
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding-bottom: 32px;
          ">
            <!-- Title -->
            <h3 style="
              color: white;
              font-size: 16px;
              font-weight: bold;
              line-height: 1.2;
              margin: 0 0 12px 0;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            ">${newsItem.title}</h3>
            
            <!-- Synthesis -->
            ${truncatedSynthesis ? `
              <p style="
                color: rgba(255, 255, 255, 0.95);
                font-size: 12px;
                line-height: 1.6;
                margin: 0;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
              ">${truncatedSynthesis}</p>
            ` : ''}
          </div>

          <!-- Footer -->
          <div style="
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.25);
          ">
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              color: rgba(255, 255, 255, 0.8);
              font-size: 10px;
            ">
              <span style="font-weight: 500;">SO: Monitorul Oficial ${partea}</span>
              <span style="font-weight: 500;">#${index + 1}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const generateAndDownloadCard = async (newsItem: NewsItem, index: number): Promise<boolean> => {
    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-2000px';
      container.style.left = '0';
      container.style.zIndex = '-1';
      container.innerHTML = generateCardHTML(newsItem, index);
      
      document.body.appendChild(container);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Dynamic import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture the card
      const cardElement = container.firstElementChild as HTMLElement;
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#0B132B',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 400,
        height: 400,
        imageTimeout: 15000,
      });

      // Convert to blob and download
      const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png', 1.0);
      });

      // Create download
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instagram-${newsItem.id}-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Cleanup
      document.body.removeChild(container);
      
      return true;
    } catch (error) {
      console.error(`Failed to generate card for news ${newsItem.id}:`, error);
      return false;
    }
  };

  const handleBatchScreenshot = async () => {
    const filteredNews = getFilteredNews();
    
    if (filteredNews.length === 0) {
      alert('Nu există știri pentru ziua curentă!');
      return;
    }

    if (!confirm(`Vrei să generezi ${filteredNews.length} imagini pentru știrile ${filterToday ? 'din ziua curentă' : 'selectate'}? Acest proces poate dura câteva minute.`)) {
      return;
    }

    setIsProcessing(true);
    setCurrentIndex(0);
    setResults({ success: 0, failed: 0, total: filteredNews.length });

    for (let i = 0; i < filteredNews.length; i++) {
      setCurrentIndex(i + 1);
      
      const success = await generateAndDownloadCard(filteredNews[i], i);
      
      setResults(prev => ({
        ...prev,
        success: prev.success + (success ? 1 : 0),
        failed: prev.failed + (success ? 0 : 1)
      }));

      // Small delay between screenshots to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsProcessing(false);
    alert(`Proces finalizat! Succes: ${results.success + (results.total > 0 ? 1 : 0)}, Eșuate: ${results.failed}`);
  };

  const filteredNews = getFilteredNews();
  const todayCount = filteredNews.length;

  const handleAllScreenshots = async () => {
    if (news.length === 0) return;
    
    if (!confirm(`Vrei să generezi ${news.length} imagini pentru toate știrile? Acest proces poate dura câteva minute.`)) {
      return;
    }

    setIsProcessing(true);
    setCurrentIndex(0);
    setResults({ success: 0, failed: 0, total: news.length });

    for (let i = 0; i < news.length; i++) {
      setCurrentIndex(i + 1);
      
      const success = await generateAndDownloadCard(news[i], i);
      
      setResults(prev => ({
        ...prev,
        success: prev.success + (success ? 1 : 0),
        failed: prev.failed + (success ? 0 : 1)
      }));

      // Small delay between screenshots
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsProcessing(false);
    alert(`Proces finalizat! Succes: ${results.success + (results.total > 0 ? 1 : 0)}, Eșuate: ${results.failed}`);
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
      <div className="text-white/60 text-xs text-center">
        {filterToday 
          ? `${todayCount} știri din ziua curentă găsite`
          : `${todayCount} știri disponibile`
        }
      </div>
    </div>
  );
}
