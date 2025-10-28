'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCategories } from '@/contexts/CategoriesContext';
import { redirect } from 'next/navigation';


export default function CategoriesListPage() {
  const { user, loading: authLoading, hasPremiumAccess } = useAuth();
  const { categories, loading, error } = useCategories();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login');
    }
  }, [user, authLoading]);

  // Redirect to pricing if authenticated but no premium access or subscription error
  useEffect(() => {
    if (!authLoading && user && !hasPremiumAccess && (error === 'SUBSCRIPTION_REQUIRED' || error === 'Failed to fetch categories')) {
      redirect('/preturi');
    }
  }, [user, authLoading, hasPremiumAccess, error]);

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

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-responsive flex-1 py-8">
        <div className="mb-6">
          <nav className="text-sm text-gray-500" aria-label="breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:underline">Acasă</Link>
              </li>
              <li>/</li>
              <li className="text-gray-700">Categorii</li>
            </ol>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Categorii</h1>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Se încarcă...</div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Nu există categorii disponibile.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 xl:gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categorii/${c.slug}`}
                className="block rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <div className="text-base font-medium text-gray-900">{c.name.charAt(0).toUpperCase() + c.name.slice(1)}</div>
                <div className="text-sm text-gray-500">{c.count} articole</div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}



