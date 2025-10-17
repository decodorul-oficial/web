// Performance optimization utilities

// Preload critical components
export function preloadCriticalComponents() {
  if (typeof window !== 'undefined') {
    // Preload critical components after initial page load
    setTimeout(() => {
      import('@/components/ui/ShareButtons');
      import('@/components/ui/FavoriteButton');
      import('@/components/ui/ExportButton');
    }, 1000);
  }
}

// Lazy load non-critical components
export function lazyLoadNonCriticalComponents() {
  if (typeof window !== 'undefined') {
    // Load heavy components after user interaction or scroll
    const loadHeavyComponents = () => {
      import('@/features/news/components/TablesRenderer');
      import('@/components/legislative/AuthenticatedLegislativeNetworkSection');
      import('@/features/comments');
    };

    // Load on user interaction
    const events = ['mousedown', 'touchstart', 'keydown'];
    const loadOnInteraction = () => {
      loadHeavyComponents();
      events.forEach(event => {
        document.removeEventListener(event, loadOnInteraction);
      });
    };

    events.forEach(event => {
      document.addEventListener(event, loadOnInteraction, { once: true });
    });

    // Also load after 3 seconds regardless of interaction
    setTimeout(loadHeavyComponents, 3000);
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  if (typeof window !== 'undefined') {
    preloadCriticalComponents();
    lazyLoadNonCriticalComponents();
  }
}
