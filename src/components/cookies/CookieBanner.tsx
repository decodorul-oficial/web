"use client";
import { useConsent } from './ConsentProvider';
import { trackConsent } from '../../lib/analytics';

export function CookieBanner() {
  const { consent, setConsent } = useConsent();
  
  if (consent) {
    return null;
  }

  const handleReject = () => {
    setConsent({ essential: true, analytics: false });
    // Track consent rejection - this will only work if analytics is already loaded
    // or will be ignored if gtag is not available
    trackConsent('analytics', false);
  };

  const handleAcceptAll = () => {
    setConsent({ essential: true, analytics: true });
    // Track consent acceptance - this will only work if analytics is already loaded
    // or will be ignored if gtag is not available
    trackConsent('analytics', true);
  };

  return (
    <>
      {/* Backdrop to darken the rest of the application */}
      <div className="fixed inset-0 bg-black/30 z-[60]" />
      
      {/* Cookie Banner */}
      <div className="fixed inset-x-0 bottom-0 z-[70] border-t bg-white/95 shadow-lg">
        <div className="container-responsive py-4 text-sm">
          <p className="mb-3 text-gray-700">
            Folosim cookie-uri esențiale pentru funcționarea site-ului. Pentru cookie-uri de analiză (ex. trafic),
            avem nevoie de consimțământul tău. Poți accepta, respinge sau personaliza opțiunile.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 justify-center sm:justify-start">
            <button
              className="rounded bg-gray-200 px-3 py-1 text-gray-800 hover:bg-gray-300 transition-colors"
              onClick={handleReject}
            >
              Respinge
            </button>
            <button
              className="rounded bg-brand-info px-3 py-1 text-white hover:opacity-90 transition-opacity"
              onClick={handleAcceptAll}
            >
              Acceptă toate
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center sm:text-left">
            Vezi {" "}
            <a href="/privacy" className="text-brand-info hover:underline">
              Politica de Confidențialitate
            </a>{" "}
            și {" "}
            <a href="/cookies" className="text-brand-info hover:underline">
              Politica de Cookies
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}


