'use client';

import { useEffect } from 'react';

export function ZoomPrevention() {
  useEffect(() => {
    // Prevent zoom on input focus
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        target.style.fontSize = '16px';
      }
    };

    // Prevent pinch-to-zoom
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const handleTouchEnd = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Prevent wheel zoom
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    // Prevent keyboard zoom
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-' || event.key === '=')) {
        event.preventDefault();
      }
    };

    // Additional iOS zoom prevention
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    const handleGestureStart = (event: Event) => {
      event.preventDefault();
    };

    const handleGestureChange = (event: Event) => {
      event.preventDefault();
    };

    const handleGestureEnd = (event: Event) => {
      event.preventDefault();
    };

    // Add event listeners
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);

    if (isIOS) {
      document.addEventListener('gesturestart', handleGestureStart);
      document.addEventListener('gesturechange', handleGestureChange);
      document.addEventListener('gestureend', handleGestureEnd);
    }

    // Cleanup
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      
      if (isIOS) {
        document.removeEventListener('gesturestart', handleGestureStart);
        document.removeEventListener('gesturechange', handleGestureChange);
        document.removeEventListener('gestureend', handleGestureEnd);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
