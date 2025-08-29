'use client';

import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

interface UseMobileScreenshotOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

interface ScreenshotState {
  isCapturing: boolean;
  isSuccess: boolean;
  error: string | null;
}

export function useMobileScreenshot(options: UseMobileScreenshotOptions = {}) {
  const { filename = 'instagram-post', quality = 1.0, scale = 2 } = options;
  
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

  // Detect if we're on mobile
  const isMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }, []);

  // Enhanced screenshot function for mobile devices
  const captureScreenshot = useCallback(async (element: HTMLElement): Promise<Blob> => {
    // Ensure images are loaded and fonts are ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Wait for fonts if available
    if ('fonts' in document) {
      try {
        await document.fonts.ready;
      } catch (error) {
        console.warn('Font loading failed:', error);
      }
    }

    // Ensure all images are loaded
    const images = element.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true);
      });
    }));

    // Configure html2canvas for mobile optimization
    const canvas = await html2canvas(element, {
      backgroundColor: '#0B132B',
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      imageTimeout: 15000,
      foreignObjectRendering: false, // Better mobile compatibility
      ignoreElements: (el) => {
        return el.classList.contains('animate-spin') || 
               el.classList.contains('transition-') ||
               el.getAttribute('data-ignore-screenshot') === 'true';
      },
      onclone: (clonedDoc) => {
        // Fix any styling issues in the cloned document
        const clonedElement = clonedDoc.querySelector('[data-screenshot-target]');
        if (clonedElement) {
          // Ensure consistent rendering across devices
          (clonedElement as HTMLElement).style.transform = 'none';
          (clonedElement as HTMLElement).style.transition = 'none';
        }
      }
    });

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      }, 'image/png', quality);
    });
  }, [scale, quality]);

  // Save to device with iOS optimization
  const saveToDevice = useCallback(async (element: HTMLElement, customFilename?: string) => {
    setState({ isCapturing: true, isSuccess: false, error: null });

    try {
      const imageBlob = await captureScreenshot(element);
      const finalFilename = `${customFilename || filename}-${new Date().toISOString().slice(0, 10)}.png`;

      // For iOS devices, try Web Share API first
      if (typeof window !== 'undefined' && isIOS() && navigator.share && navigator.canShare) {
        const file = new File([imageBlob], finalFilename, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Monitorul Oficial - Instagram Post',
            files: [file]
          });
          
          setState({ isCapturing: false, isSuccess: true, error: null });
          setTimeout(() => setState(prev => ({ ...prev, isSuccess: false })), 3000);
          return;
        }
      }

      // Fallback to download link
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      
      // For mobile devices, add additional attributes
      if (isMobile()) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      setState({ isCapturing: false, isSuccess: true, error: null });
      setTimeout(() => setState(prev => ({ ...prev, isSuccess: false })), 3000);
      
    } catch (error) {
      console.error('Screenshot failed:', error);
      setState({ 
        isCapturing: false, 
        isSuccess: false, 
        error: error instanceof Error ? error.message : 'Screenshot failed' 
      });
      setTimeout(() => setState(prev => ({ ...prev, error: null })), 5000);
    }
  }, [captureScreenshot, filename, isIOS, isMobile]);

  // Share directly (iOS optimized)
  const shareDirectly = useCallback(async (element: HTMLElement, shareData?: ShareData) => {
    setState({ isCapturing: true, isSuccess: false, error: null });

    try {
      const imageBlob = await captureScreenshot(element);
      const file = new File([imageBlob], `${filename}.png`, { type: 'image/png' });

      if (typeof window !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: shareData?.title || 'Monitorul Oficial - Instagram Post',
          text: shareData?.text || 'Știre din Monitorul Oficial',
          files: [file],
          ...shareData
        });
        
        setState({ isCapturing: false, isSuccess: true, error: null });
        setTimeout(() => setState(prev => ({ ...prev, isSuccess: false })), 3000);
      } else {
        // Fallback to save
        await saveToDevice(element);
      }
      
    } catch (error) {
      console.error('Share failed:', error);
      setState({ 
        isCapturing: false, 
        isSuccess: false, 
        error: error instanceof Error ? error.message : 'Share failed' 
      });
      setTimeout(() => setState(prev => ({ ...prev, error: null })), 5000);
    }
  }, [captureScreenshot, filename, saveToDevice]);

  // Check if Web Share API is supported
  const canShare = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return 'share' in navigator && 'canShare' in navigator;
  }, []);

  return {
    ...state,
    saveToDevice,
    shareDirectly,
    canShare: canShare(),
    isIOS: isIOS(),
    isMobile: isMobile(),
  };
}
