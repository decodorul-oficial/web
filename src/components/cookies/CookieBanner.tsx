"use client";
import { useConsent } from './ConsentProvider';

export function CookieBanner() {
  const { consent, setConsent } = useConsent();
  if (consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 shadow-lg">
      <div className="container-responsive py-4 text-sm">
        <p className="mb-3 text-gray-700">
          Folosim cookie-uri esențiale pentru funcționarea site-ului. Pentru cookie-uri de analiză (ex. trafic),
          avem nevoie de consimțământul tău. Poți accepta, respinge sau personaliza opțiunile.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded bg-gray-200 px-3 py-1 text-gray-800 hover:bg-gray-300"
            onClick={() => setConsent({ essential: true, analytics: false })}
          >
            Respinge
          </button>
          <button
            className="rounded bg-brand-info px-3 py-1 text-white hover:opacity-90"
            onClick={() => setConsent({ essential: true, analytics: true })}
          >
            Acceptă toate
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
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
  );
}


