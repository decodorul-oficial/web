'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function AdminTestPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (!loading && user && !isAdmin) {
      router.push('/');
      return;
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-info"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-responsive flex-1 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/admin"
              className="flex items-center space-x-2 text-gray-600 hover:text-brand-info transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Înapoi la Dashboard</span>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Test Admin Functionality</h1>
          <p className="text-gray-600">Verifică dacă funcționalitățile admin funcționează corect</p>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Rezultate Teste</h2>
          
          <div className="space-y-4">
            {/* Authentication Test */}
            <div className="flex items-center space-x-3">
              {user ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="text-gray-700">
                Autentificare: {user ? 'Utilizator autentificat' : 'Nu este autentificat'}
              </span>
            </div>

            {/* Admin Role Test */}
            <div className="flex items-center space-x-3">
              {isAdmin ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="text-gray-700">
                Rol Admin: {isAdmin ? 'Utilizator cu rol de admin' : 'Nu are rol de admin'}
              </span>
            </div>

            {/* User Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Informații Utilizator</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>ID:</strong> {user?.id}</p>
                <p><strong>Creat la:</strong> {user?.created_at ? new Date(user.created_at).toLocaleString('ro-RO') : 'N/A'}</p>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Acțiuni Admin Disponibile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/admin"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">Dashboard Principal</h4>
                  <p className="text-sm text-gray-600">Vezi statistici și KPI-uri</p>
                </Link>
                
                <Link
                  href="/admin/instagram"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">Manage Instagram</h4>
                  <p className="text-sm text-gray-600">Gestionează postările pe Instagram</p>
                </Link>
                
                <Link
                  href="/admin/diagnostic"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">Diagnostic</h4>
                  <p className="text-sm text-gray-600">Verifică statusul sistemului</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
