'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRecaptchaContext } from '@/components/auth/RecaptchaProvider';
import { UserService } from '@/features/user/services/userService';
import { supabase } from '@/lib/supabase/client';

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const { executeRecaptcha, isLoaded: recaptchaLoaded, error: recaptchaError } = useRecaptchaContext();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-info mx-auto mb-4"></div>
            <p className="text-gray-600">Se încarcă...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword) {
      setError('Te rugăm să completezi toate câmpurile.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Parola nouă trebuie să aibă cel puțin 8 caractere.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Parola nouă și confirmarea nu coincid.');
      return;
    }

    setSubmitting(true);
    try {
      // Execute reCAPTCHA for password change action
      if (!recaptchaLoaded) {
        setError('reCAPTCHA nu este încărcat. Vă rugăm să încercați din nou.');
        setSubmitting(false);
        return;
      }

      const recaptchaToken = await executeRecaptcha('change_password');
      if (!recaptchaToken) {
        setError('Verificarea reCAPTCHA a eșuat. Vă rugăm să încercați din nou.');
        setSubmitting(false);
        return;
      }

      const ok = await UserService.changePassword({ 
        currentPassword, 
        newPassword,
        recaptchaToken 
      });
      if (ok) {
        // Clear auth state and storage to force re-authentication
        try {
          await supabase.auth.signOut();
        } catch {}
        try {
          UserService.setAuthToken(null);
        } catch {}
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('DO_TOKEN');
          }
        } catch {}

        setSuccess('Parola a fost schimbată. Te rugăm să te autentifici din nou.');
        router.replace('/login');
        // Optional full reload to reset any in-memory caches
        setTimeout(() => {
          if (typeof window !== 'undefined') window.location.reload();
        }, 50);
      } else {
        setError('Nu am putut schimba parola. Verifică parola curentă și încearcă din nou.');
      }
    } catch (e) {
      setError('A apărut o eroare neașteptată.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-responsive flex-1 py-8">
        <div className="max-w-xl mx-auto">
          <nav className="text-sm text-gray-500 mb-4" aria-label="breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/" className="hover:underline">Acasă</a>
              </li>
              <li>/</li>
              <li>
                <a href="/profile" className="hover:underline">Profil</a>
              </li>
              <li>/</li>
              <li className="text-gray-700">Schimbă Parola</li>
            </ol>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight mb-6">Schimbă Parola</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">{success}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parola curentă</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-info focus:ring-brand-info"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Ai uitat parola curentă? Te rugăm să ne contactezi la
                <a href="mailto:contact@decodoruloficial.ro" className="text-brand-info hover:underline ml-1">
                  contact@decodoruloficial.ro
                </a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parola nouă</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-info focus:ring-brand-info"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmă parola nouă</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-info focus:ring-brand-info"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info disabled:opacity-50"
              >
                {submitting ? 'Se salvează...' : 'Schimbă Parola'}
              </button>
              <a href="/profile" className="text-sm text-gray-600 hover:underline">Anulează</a>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}


