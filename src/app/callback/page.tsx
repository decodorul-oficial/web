'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function LinkedInCallbackContent() {
  const searchParams = useSearchParams();
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extragem parametrii din URL
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    
    if (code) {
      setAuthorizationCode(code);
    } else {
      setError('Nu s-a primit codul de autorizare de la LinkedIn');
    }
    
    if (stateParam) {
      setState(stateParam);
    }
  }, [searchParams]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Codul a fost copiat în clipboard!');
    } catch (err) {
      console.error('Eroare la copierea în clipboard:', err);
      alert('Eroare la copierea în clipboard. Vă rugăm să copiați manual.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Eroare</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Înapoi la pagina principală
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!authorizationCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Se procesează...</h2>
            <p className="text-sm text-gray-600">Se extrag parametrii de la LinkedIn...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Autentificare LinkedIn Reușită!</h1>
          <p className="text-gray-600">
            Ați fost autentificat cu succes. Copiați codul de autorizare de mai jos pentru a-l folosi în aplicația dvs.
          </p>
        </div>

        <div className="space-y-6">
          {/* Authorization Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cod de Autorizare (Authorization Code)
            </label>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={authorizationCode}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(authorizationCode)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Copiază
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Acest cod este necesar pentru a obține un access token de la LinkedIn
            </p>
          </div>

          {/* State Parameter */}
          {state && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State Parameter
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={state}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(state)}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-r-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Copiază
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Parametrul state pentru verificarea securității
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Instrucțiuni de utilizare:</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Copiați codul de autorizare de mai sus</li>
              <li>Folosiți-l în aplicația dvs. pentru a obține un access token</li>
              <li>Codul este valabil doar o singură dată și expiră în câteva minute</li>
              <li>Nu partajați acest cod cu alții</li>
            </ol>
          </div>

          {/* Navigation */}
          <div className="flex justify-center space-x-4">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Înapoi la pagina principală
            </a>
            <button
              onClick={() => window.close()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Închide fereastra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LinkedInCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Se încarcă...</h2>
            <p className="text-sm text-gray-600">Se procesează parametrii...</p>
          </div>
        </div>
      </div>
    }>
      <LinkedInCallbackContent />
    </Suspense>
  );
}
