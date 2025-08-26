'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

interface AutoScreenshotProps {
  children: React.ReactNode;
  filename?: string;
  className?: string;
}

export function AutoScreenshot({ children, filename = 'instagram-post', className = '' }: AutoScreenshotProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const captureAndSave = async () => {
    if (!cardRef.current) return;

    setIsCapturing(true);
    setCaptureSuccess(false);

    try {
      // Configure html2canvas pentru cel mai bun rezultat
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      // Convert canvas to blob
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
        
        // Reset success message after 3 seconds
        setTimeout(() => setCaptureSuccess(false), 3000);
      }, 'image/png', 0.95);

    } catch (error) {
      console.error('Screenshot failed:', error);
      setIsCapturing(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Instagram Card */}
      <div 
        ref={cardRef}
        data-screenshot-target
        className="cursor-pointer transform transition-transform duration-200 hover:scale-105"
        style={{ padding: '8px' }}
        onClick={captureAndSave}
      >
        {children}
      </div>

      {/* Overlay during capture */}
      {isCapturing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl z-10">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
            <span className="text-gray-700 font-medium">Se salvează imaginea...</span>
          </div>
        </div>
      )}

      {/* Success message */}
      {captureSuccess && (
        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-2xl z-10">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700 font-medium">Imagine salvată cu succes!</span>
          </div>
        </div>
      )}

      {/* Click hint */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          💡 Click pe card pentru a salva automat imaginea
        </p>
      </div>
    </div>
  );
}
