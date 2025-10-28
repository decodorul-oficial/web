'use client';

import React, { useState } from 'react';
import { NewsItem } from '@/features/news/types';

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
  
  // Simplified screenshot function
  const captureAndDownloadBatch = async (element: HTMLElement, filename: string = 'instagram-post') => {
    try {
      console.log('📸 Starting captureAndDownloadBatch for:', filename);
      
      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Wait for fonts
      if ('fonts' in document) {
        try {
          await document.fonts.ready;
          console.log('✅ Fonts loaded');
        } catch (error) {
          console.warn('Font loading failed:', error);
        }
      }

      // Import html2canvas
      console.log('📦 Importing html2canvas...');
      const html2canvas = (await import('html2canvas')).default;
      console.log('✅ html2canvas imported');

      // Create canvas
      console.log('🎨 Creating canvas...');
      const canvas = await html2canvas(element, {
        backgroundColor: '#0B132B',
        scale: 1, // Use 1x scale for better compatibility
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        imageTimeout: 10000,
        ignoreElements: (el) => {
          return el.classList.contains('animate-spin');
        }
      });
      console.log('✅ Canvas created');

      // Convert to blob
      console.log('🔄 Converting to blob...');
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ Blob created, size:', blob.size);
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png', 0.9);
      });

      // Create download
      console.log('🔗 Creating download...');
      const url = URL.createObjectURL(blob);
      const finalFilename = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
      console.log('📁 Final filename:', finalFilename);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      console.log('🔗 Link added to DOM');
      
      // Trigger download
      link.click();
      console.log('✅ Download triggered');
      
      // Cleanup
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
        console.log('🧹 Cleanup completed');
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('❌ Batch screenshot failed:', error);
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

  const generateCardHTML = (newsItem: NewsItem, index: number) => {
    // Extract category
    const getCategory = () => {
      if (typeof newsItem.content === 'object' && newsItem.content !== null) {
        const content = newsItem.content as NewsContent;
        const rawCategory = content.category || content.type || '';
        return rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
      }
      return '';
    };

    const category = getCategory();

    // Extract author from content
    const getAuthor = () => {
      if (typeof newsItem.content === 'object' && newsItem.content !== null) {
        const content = newsItem.content as NewsContent;
        return content.author || 'Monitorul Oficial';
      }
      return 'Monitorul Oficial';
    };

    const author = getAuthor();

    // Use exact same structure as InstagramPreview.tsx
    return `
      <div class="instagram-card" style="
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        background-color: #0B132B;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      ">
        
        <!-- Background Gradient - Same as InstagramPreview -->
        <div class="background-gradient" style="
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #3A506B 100%);
          opacity: 0.95;
        "></div>
        
        <!-- Content Container - Same as InstagramPreview -->
        <div class="content-container" style="
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 24px 55px;
        ">
          
          <!-- Header - Same as InstagramPreview -->
          <div class="header" style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0px;
          ">
            <!-- Logo Container - Same as InstagramPreview -->
            <div class="logo-container" style="
              display: inline-flex;
              align-items: center;
              gap: 6px;
            ">
              <div class="logo-wrapper" style="
                width: 40px;
                height: 40px;
                background-color: #FFFFFF;
                border-radius: 12px;
                display: grid;
                place-items: center;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                flex-shrink: 0;
              ">
                <span style="color: #0B132B; font-size: 16px; font-weight: bold;">📋</span>
              </div>
            </div>
            
            <!-- Category Badge - Same as InstagramPreview -->
            ${category ? `
              <div class="category-badge" style="
                background-color: rgba(255, 255, 255, 0.25);
                color: #FFFFFF;
                font-size: 14px;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                flex-shrink: 0;
              ">${category}</div>
            ` : ''}
          </div>

          <!-- Main Content - Same as InstagramPreview -->
          <div class="main-content" style="
            top: 10px;
            position: relative;
            flex: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
          ">
            <!-- Title - Same as InstagramPreview -->
            <h1 class="title" style="
              color: #FFFFFF;
              font-size: 20px;
              font-weight: bold;
              line-height: 1.2;
              margin-bottom: 12px;
              padding-bottom: 10px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: block;
              max-height: calc(1.3em * 4);
              white-space: normal;
            ">${newsItem.title}</h1>
          </div>

          <!-- Footer - Same as InstagramPreview -->
          <div class="footer" style="
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.25);
          ">
            <div class="footer-content" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              color: rgba(255, 255, 255, 0.8);
              font-size: 12px;
            ">
              <div class="footer-left" style="
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                <span class="footer-icon" style="font-size: 16px;">📋</span>
                <span class="footer-text" style="font-weight: 500;">${author}</span>
              </div>
            </div>
          </div>

          <!-- Decorative Elements - Same as InstagramPreview -->
          <div class="decorative-element1" style="
            position: absolute;
            top: 8px;
            right: 8px;
            width: 48px;
            height: 48px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
          "></div>
          <div class="decorative-element2" style="
            position: absolute;
            bottom: 16px;
            left: 8px;
            width: 24px;
            height: 24px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
          "></div>
        </div>
      </div>
    `;
  };

  const generateAndDownloadCard = async (newsItem: NewsItem, index: number): Promise<boolean> => {
    try {
      console.log(`🎨 Generating card for news ${newsItem.id} (${index + 1})`);
      
      // Create a temporary container with proper dimensions - same as AutoScreenshot
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-2000px';
      container.style.left = '0';
      container.style.zIndex = '-1';
      container.style.width = '400px'; // Set a reasonable width
      container.style.height = '400px'; // Set a reasonable height
      
      console.log('📦 Container created');
      
      // Add CSS styles to match InstagramPreview.module.css
      const style = document.createElement('style');
      style.textContent = `
        .instagram-card {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background-color: #0B132B;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }
        .background-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #3A506B 100%);
          opacity: 0.95;
        }
        .content-container {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 24px 55px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0px;
        }
        .logo-container {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .logo-wrapper {
          width: 40px;
          height: 40px;
          background-color: #FFFFFF;
          border-radius: 12px;
          display: grid;
          place-items: center;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
        }
        .category-badge {
          background-color: rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .main-content {
          top: 10px;
          position: relative;
          flex: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .title {
          color: #FFFFFF;
          font-size: 20px;
          font-weight: bold;
          line-height: 1.2;
          margin-bottom: 12px;
          padding-bottom: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
          max-height: calc(1.3em * 4);
          white-space: normal;
        }
        .footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.25);
        }
        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
        }
        .footer-left {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .footer-icon {
          font-size: 16px;
        }
        .footer-text {
          font-weight: 500;
        }
        .decorative-element1 {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 48px;
          height: 48px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        .decorative-element2 {
          position: absolute;
          bottom: 16px;
          left: 8px;
          width: 24px;
          height: 24px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
      `;
      document.head.appendChild(style);
      
      container.innerHTML = generateCardHTML(newsItem, index);
      document.body.appendChild(container);
      
      // Wait for rendering - same as AutoScreenshot
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the card element and add data-screenshot-target attribute
      const cardElement = container.firstElementChild as HTMLElement;
      cardElement.setAttribute('data-screenshot-target', newsItem.id);
      
      console.log(`Card element created for ${newsItem.id}, dimensions:`, {
        width: cardElement.offsetWidth,
        height: cardElement.offsetHeight
      });
      
      // Use the batch screenshot function for consistent behavior
      const result = await captureAndDownloadBatch(cardElement, `instagram-${newsItem.id}`);
      
      console.log(`Screenshot result for ${newsItem.id}:`, result);
      
      // Cleanup
      document.body.removeChild(container);
      // Remove the added style element
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to generate card for news ${newsItem.id}:`, error);
      return false;
    }
  };

  const handleBatchScreenshot = async () => {
    console.log('🚀 handleBatchScreenshot called');
    alert('🚀 handleBatchScreenshot called - check console for details');
    
    try {
      const filteredNews = getFilteredNews();
      console.log('📊 Filtered news:', filteredNews.length);
      
      if (filteredNews.length === 0) {
        alert('Nu există știri pentru ziua curentă!');
        return;
      }

      if (!confirm(`Vrei să generezi ${filteredNews.length} imagini pentru știrile ${filterToday ? 'din ziua curentă' : 'selectate'}? Acest proces poate dura câteva minute.`)) {
        console.log('❌ User cancelled');
        return;
      }

      console.log('✅ User confirmed, starting processing...');
      setIsProcessing(true);
      setCurrentIndex(0);
      setResults({ success: 0, failed: 0, total: filteredNews.length });

      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < filteredNews.length; i++) {
        setCurrentIndex(i + 1);
        
        console.log(`Processing news ${i + 1}/${filteredNews.length}: ${filteredNews[i].id}`);
        
        const success = await generateAndDownloadCard(filteredNews[i], i);
        
        if (success) {
          successCount++;
          console.log(`✅ Success for news ${filteredNews[i].id}`);
        } else {
          failedCount++;
          console.log(`❌ Failed for news ${filteredNews[i].id}`);
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
    console.log('🚀 handleAllScreenshots called');
    alert('🚀 handleAllScreenshots called - check console for details');
    
    console.log('📊 News length:', news.length);
    if (news.length === 0) {
      console.log('❌ No news available, returning');
      return;
    }
    
    console.log('❓ Showing confirm dialog...');
    
    // Try a more explicit confirmation approach
    const message = `Vrei să generezi ${news.length} imagini pentru toate știrile? Acest proces poate dura câteva minute.`;
    console.log('📝 Confirm message:', message);
    
    // Test if confirm is working properly
    console.log('🔍 Testing confirm function...');
    const testConfirm = window.confirm('Test dialog - apasă OK pentru a continua');
    console.log('🧪 Test confirm result:', testConfirm);
    
    if (!testConfirm) {
      console.log('❌ Test confirm failed, user cancelled test');
      alert('Test confirm failed - user cancelled test dialog');
      return;
    }
    
    console.log('✅ Test confirm passed, showing main confirm...');
    const confirmed = window.confirm(message);
    console.log('✅ Confirm result:', confirmed);
    console.log('✅ Confirm type:', typeof confirmed);
    
    if (!confirmed) {
      console.log('❌ User cancelled, returning');
      alert('Procesul a fost anulat de utilizator');
      return;
    }
    
    console.log('✅ User confirmed, proceeding...');

    console.log('🔄 Setting processing state...');
    setIsProcessing(true);
    setCurrentIndex(0);
    setResults({ success: 0, failed: 0, total: news.length });

    let successCount = 0;
    let failedCount = 0;

    console.log(`🔄 Starting loop for ${news.length} news items...`);
    for (let i = 0; i < news.length; i++) {
      console.log(`🔄 Processing news ${i + 1}/${news.length}: ${news[i].id}`);
      setCurrentIndex(i + 1);
      
      console.log(`🎨 Calling generateAndDownloadCard for news ${news[i].id}...`);
      const success = await generateAndDownloadCard(news[i], i);
      console.log(`📊 generateAndDownloadCard result for ${news[i].id}:`, success);
      
      if (success) {
        successCount++;
        console.log(`✅ Success for news ${news[i].id}`);
      } else {
        failedCount++;
        console.log(`❌ Failed for news ${news[i].id}`);
      }
      
      setResults(prev => ({
        ...prev,
        success: successCount,
        failed: failedCount
      }));

      console.log(`⏳ Waiting 500ms before next item...`);
      // Small delay between screenshots
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('🏁 Loop completed, setting processing to false...');
    setIsProcessing(false);
    console.log(`🏁 Final results - Success: ${successCount}, Failed: ${failedCount}`);
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
