"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription, usePaymentMethods, useSubscriptionUsage } from '@/features/subscription/hooks/useSubscription';
import { SubscriptionStatusCard } from '@/components/subscription/SubscriptionStatusCard';
import { Loader2, User, CreditCard, Settings } from 'lucide-react';

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { subscription, loading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { usage, loading: usageLoading } = useSubscriptionUsage();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, authLoading, router]);

  if (authLoading || subscriptionLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-info mx-auto" />
            <p className="mt-2 text-gray-600">Se încarcă...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Contul Meu</h1>
              <p className="mt-2 text-gray-600">
                Gestionează abonamentul și preferințele contului tău
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Subscription Status */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Abonament
                  </h2>
                  {subscription ? (
                    <SubscriptionStatusCard 
                      subscription={subscription} 
                      onUpdate={refetchSubscription}
                    />
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nu ai un abonament activ
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Alege un plan pentru a debloca funcționalitățile premium
                      </p>
                      <button
                        onClick={() => router.push('/preturi')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
                      >
                        Alege Planul
                      </button>
                    </div>
                  )}
                </section>

                {/* Payment Methods */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Metode de Plată
                  </h2>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    {paymentMethodsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-info" />
                      </div>
                    ) : paymentMethods.length > 0 ? (
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <CreditCard className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {method.brand.toUpperCase()} •••• {method.last4}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Expiră {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                                </p>
                              </div>
                            </div>
                            {method.isDefault && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Implicit
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Nu ai metode de plată configurate
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Usage Statistics */}
                {usage && (
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Utilizare
                    </h2>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            Cereri API
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-brand-info to-brand-accent h-2 rounded-full"
                                style={{ 
                                  width: `${Math.min((usage.requestsUsed / usage.requestsLimit) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {usage.requestsUsed} / {usage.requestsLimit}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            Perioada Curentă
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(usage.currentPeriodStart).toLocaleDateString('ro-RO')} - {new Date(usage.currentPeriodEnd).toLocaleDateString('ro-RO')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Acțiuni Rapide
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/preturi')}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
                    >
                      Schimbă Planul
                    </button>
                    <button
                      onClick={() => router.push('/profile')}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Setări Profil
                    </button>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informații Cont
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Membru din</p>
                      <p className="text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('ro-RO')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Status</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Support */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Suport
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Ai nevoie de ajutor? Contactează-ne pentru asistență.
                  </p>
                  <button
                    onClick={() => router.push('/contact')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
                  >
                    Contactează-ne
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
