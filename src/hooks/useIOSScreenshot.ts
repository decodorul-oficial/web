'use client';

import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

interface ScreenshotState {
  isCapturing: boolean;
  isSuccess: boolean;
  error: string | null;
}

export function useIOSScreenshot() {
  const [state, setState] = useState<ScreenshotState>({
    isCapturing: false,
    isSuccess: false,
    error: null,
  });

  // Detect if we're on iOS
  const isIOS = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }, []);

  // Simple screenshot and download for iOS
  const captureAndDownload = useCallback(async (element: HTMLElement, filename: string = 'instagram-post') => {
    setState({ isCapturing: true, isSuccess: false, error: null });

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

      // Create canvas with high quality settings for mobile
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
      if (isIOS()) {
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
      
      setState({ isCapturing: false, isSuccess: true, error: null });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, isSuccess: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Screenshot failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Screenshot failed';
      setState({ 
        isCapturing: false, 
        isSuccess: false, 
        error: errorMessage
      });
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
    }
  }, [isIOS]);

  return {
    ...state,
    captureAndDownload,
    isIOS: isIOS(),
  };
}
