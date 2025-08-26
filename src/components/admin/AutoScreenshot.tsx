'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import styles from './InstagramPreview.module.css';

interface AutoScreenshotProps {
  children: React.ReactNode;
  filename?: string;
  className?: string;
}

export function AutoScreenshot({ children, filename = 'instagram-post', className = '' }: AutoScreenshotProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Preload images and fonts to ensure they're ready for screenshot
  useEffect(() => {
    const preloadAssets = async () => {
      // Preload images and ensure correct sizing for logo
      const images = cardRef.current?.querySelectorAll('img');
      if (images && images.length > 0) {
        const imagePromises = Array.from(images).map(img => {
          // Fix for logo: force object-fit and object-position for html2canvas
          // This ensures the logo is rendered as in browser, not zoomed/cropped
          // (html2canvas sometimes ignores CSS, so we set inline style)
          if (
            img.src.includes('/logo.png') || // adjust if your logo path changes
            img.classList.contains('logoImage')
          ) {
            img.style.objectFit = 'contain';
            img.style.objectPosition = 'center';
            img.style.width = img.width ? `${img.width}px` : img.style.width;
            img.style.height = img.height ? `${img.height}px` : img.style.height;
          }
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
            }
          });
        });
        await Promise.all(imagePromises);
      }

      // Preload fonts
      if ('fonts' in document) {
        try {
          await document.fonts.ready;
        } catch (error) {
          console.warn('Font loading failed:', error);
        }
      }

      setImagesLoaded(true);
    };

    preloadAssets();
  }, []);

  const captureAndSave = async () => {
    if (!cardRef.current || !imagesLoaded) return;

    setIsCapturing(true);
    setCaptureSuccess(false);

    try {
      // Wait a bit for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Add screenshot mode class to optimize rendering
      const element = cardRef.current;
      if (element) {
        element.classList.add(styles.screenshotMode);
      }

      // Before screenshot: ensure all logo images have correct object-fit/object-position
      const logoImgs = cardRef.current.querySelectorAll('img');
      logoImgs.forEach(img => {
        if (
          img.src.includes('/logo.png') ||
          img.classList.contains('logoImage')
        ) {
          img.style.objectFit = 'contain';
          img.style.objectPosition = 'center';
          img.style.width = img.width ? `${img.width}px` : img.style.width;
          img.style.height = img.height ? `${img.height}px` : img.style.height;
        }
      });

      // Simplified html2canvas configuration to avoid iframe issues
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
        link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        setCaptureSuccess(true);
        setIsCapturing(false);
        
        // Remove screenshot mode class
        if (element) {
          element.classList.remove(styles.screenshotMode);
        }
        
        // Reset success message after 3 seconds
        setTimeout(() => setCaptureSuccess(false), 3000);
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Screenshot failed:', error);
      setIsCapturing(false);
      
      // Remove screenshot mode class on error
      const element = cardRef.current;
      if (element) {
        element.classList.remove(styles.screenshotMode);
      }
    }
  };

  return (
    <div className={`${styles.screenshotWrapper} ${className}`}>
      {/* Instagram Card */}
      <div 
        ref={cardRef}
        data-screenshot-target
        className={`${styles.screenshotTarget} ${styles.screenshotOptimized}`}
        onClick={captureAndSave}
      >
        {children}
      </div>

      {/* Overlay during capture */}
      {isCapturing && (
        <div className={styles.captureOverlay}>
          <div className={styles.captureMessage}>
            <div className={styles.spinner}></div>
            <span className="text-gray-700 font-medium">Se salvează imaginea...</span>
          </div>
        </div>
      )}

      {/* Success message */}
      {captureSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successMessage}>
            <svg className={styles.successIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700 font-medium">Imagine salvată cu succes!</span>
          </div>
        </div>
      )}

      {/* Click hint */}
      <div className={styles.clickHint}>
        <p className={styles.clickHintText}>
          💡 Click pe card pentru a salva automat imaginea
        </p>
      </div>
    </div>
  );
}
