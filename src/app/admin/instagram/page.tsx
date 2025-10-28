'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, Instagram } from 'lucide-react';
import { InstagramFeed } from '@/components/admin/InstagramFeed';

export default function AdminInstagramPage() {
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
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-pink-100 rounded-full">
              <Instagram className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Instagram</h1>
              <p className="text-gray-600">Generează imagini în stil Instagram pentru ultimele știri</p>
            </div>
          </div>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-info"></div>
          </div>
        }>
          <InstagramFeed />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
