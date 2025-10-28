'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/auth/AuthProvider';
import { CronJobsManager } from '@/components/diagnostic/CronJobsManager';
import { ArrowLeft, Activity } from 'lucide-react';

export default function DiagnosticPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?returnUrl=/admin/diagnostic');
      return;
    }
    
    if (!authLoading && user && !isAdmin) {
      router.push('/');
      return;
    }
  }, [user, isAdmin, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8">
          <div className="py-12 text-center text-gray-500">Se încarcă...</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render if not authenticated or not admin (will redirect)
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-responsive flex-1 py-8">
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
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Diagnostic & Admin Tools</h1>
              <p className="text-gray-600">Instrumente de administrare și diagnostic pentru platformă</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <CronJobsManager />
        </div>
      </main>
      <Footer />
    </div>
  );
}
