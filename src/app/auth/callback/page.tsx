'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/'; // Permite o destinație de redirectare, cu fallback la homepage

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          // Folosim 'replace' pentru a nu lăsa pagina de callback în istoricul browser-ului
          router.replace(next);
        } else {
            // Gestionează eroarea, poate cu un redirect la login
            console.error('Error exchanging code for session:', error);
            router.replace(`/login?error=${encodeURIComponent('Autentificarea a eșuat.')}`);
        }
      } else {
        // Dacă nu există cod, redirectează la login
        router.replace(`/login?error=${encodeURIComponent('Codul de autorizare nu a fost găsit.')}`);
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  // Această pagină va afișa doar un indicator de încărcare cât timp rulează procesul asincron
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-info mx-auto mb-4"></div>
        <p className="text-gray-600">Finalizăm autentificarea...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-info mx-auto mb-4"></div>
                <p className="text-gray-600">Se încarcă...</p>
            </div>
        </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
