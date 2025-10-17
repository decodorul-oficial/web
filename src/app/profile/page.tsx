'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/auth/AuthProvider';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { AccountSettings } from '@/components/user/AccountSettings';
import { InterestsSection } from '@/components/user/InterestsSection';

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push('/');
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-info mx-auto mb-4"></div>
            <p className="text-gray-600">Se încarcă profilul...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-responsive flex-1 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <nav className="text-sm text-gray-500" aria-label="breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <a href="/" className="hover:underline">Acasă</a>
                </li>
                <li>/</li>
                <li className="text-gray-700">Profil</li>
              </ol>
            </nav>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Profilul meu</h1>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
            {/* Left Column - Profile and Settings (1/3 width) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Account Settings */}
              <AccountSettings 
                onSignOut={handleSignOut}
                isSigningOut={isSigningOut}
              />

              {/* Interests Section */}
              <InterestsSection 
                preferredCategories={profile?.preferredCategories || profile?.preferred_categories}
              />
            </div>

            {/* Right Column - Subscription Management (2/3 width) */}
            <div className="lg:col-span-2">
              <SubscriptionManager />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
