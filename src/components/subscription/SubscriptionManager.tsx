'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { subscriptionService } from '@/features/subscription/services/subscriptionService';
import { Subscription, SubscriptionTier, SubscriptionUsage, EnhancedUser } from '@/features/subscription/types';
import { AlertCircle, CheckCircle, Clock, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export function SubscriptionManager() {
  const { user, hasPremiumAccess } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [enhancedProfile, setEnhancedProfile] = useState<EnhancedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [planLoading, setPlanLoading] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'subscription' | 'billing'>('subscription');
  const [subscriptionSectionLoading, setSubscriptionSectionLoading] = useState(false);

  const loadData = async () => {
    try {
      const [subscriptionData, tiersData, profileData] = await Promise.all([
        subscriptionService.getMySubscription(),
        subscriptionService.getAvailableTiers(),
        subscriptionService.getMyProfile()
      ]);
      
      setSubscription(subscriptionData);
      setTiers(tiersData);
      setEnhancedProfile(profileData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Eroare la încărcarea datelor abonamentului');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm('Ești sigur că vrei să anulezi abonamentul? Vei păstra accesul până la sfârșitul perioadei curente.')) {
      return;
    }

    try {
      setCancelling(true);
      
      await subscriptionService.cancelSubscription({
        subscriptionId: subscription.id,
        immediate: false,
        refund: false,
        reason: 'Utilizator a solicitat anularea'
      });

      toast.success('Abonamentul a fost anulat cu succes');
      
      // Reload subscription data
      const updatedSubscription = await subscriptionService.getMySubscription();
      setSubscription(updatedSubscription);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Eroare la anularea abonamentului');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubscriptionManagementClick = async () => {
    setActiveSection('subscription');
    // Refresh subscription data when switching to subscription management
    setSubscriptionSectionLoading(true);
    await loadData();
    setSubscriptionSectionLoading(false);
  };

  const handleSelectPlan = async (tierId: string) => {
    if (!user) {
      window.location.href = '/login?redirect=/profile';
      return;
    }

    try {
      setPlanLoading(tierId);
      
      // Get user profile for billing address
      const billingAddress = {
        firstName: user.user_metadata?.full_name?.split(' ')[0] || 'Utilizator',
        lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'PRO',
        address: 'Adresa de facturare',
        city: 'București',
        country: 'RO',
        zipCode: '010001'
      };

      const checkoutSession = await subscriptionService.startNetopiaCheckout(
        tierId,
        user.email || '',
        billingAddress
      );

      // Redirect to Netopia checkout
      window.location.href = checkoutSession.checkoutUrl;
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast.error('Eroare la inițierea procesului de plată. Te rugăm să încerci din nou.');
    } finally {
      setPlanLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'TRIAL':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activ';
      case 'TRIAL':
        return 'Trial';
      case 'CANCELLED':
        return 'Anulat';
      case 'EXPIRED':
        return 'Expirat';
      case 'PENDING':
        return 'În așteptare';
      case 'FAILED':
        return 'Eșuat';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter and format plans from API
  const plans = tiers
    .filter(tier => tier.isActive && tier.name !== 'free' && tier.interval === selectedInterval)
    .map(tier => ({
      ...tier,
      interval: tier.interval.toLowerCase() as 'monthly' | 'yearly',
      isPopular: tier.isPopular || false
    }))
    .sort((a, b) => a.price - b.price);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand-info" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Subscription Header - Integrated Current Plan Info */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Abonamentul tău</h2>
        
        <p className="text-gray-600 mb-6">
          În prezent beneficiezi de planul{' '}
          <span className="font-semibold bg-gradient-to-r from-brand-info to-brand-accent text-white px-2 py-1 rounded-lg">
            {subscription?.tier?.displayName || 
             enhancedProfile?.profile?.activeSubscription?.tier?.displayName || 
             (enhancedProfile?.profile?.subscriptionTier === 'pro' ? 'Pro' : 'Trial Gratuit')}
          </span>
          <span className="font-semibold">
            {subscription?.status === 'ACTIVE' || enhancedProfile?.profile?.activeSubscription?.status === 'ACTIVE' ? ' (Activ)' : 
            enhancedProfile?.profile?.trialStatus?.isTrial ? ' (Trial)' : 
            hasPremiumAccess ? ' (Pro)' : ' (Trial)'}
          </span>
          {subscription?.currentPeriodEnd ? 
            `, valabil până la ${formatDate(subscription.currentPeriodEnd)}` :
            enhancedProfile?.profile?.activeSubscription?.currentPeriodEnd ?
              `, valabil până la ${formatDate(enhancedProfile.profile.activeSubscription.currentPeriodEnd)}` :
              enhancedProfile?.profile?.trialStatus?.isTrial && enhancedProfile.profile.trialStatus.trialEnd ?
                `, valabil până la ${formatDate(enhancedProfile.profile.trialStatus.trialEnd)}` :
                ''}
          .
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleSubscriptionManagementClick}
            disabled={subscriptionSectionLoading}
            className={`inline-flex items-center px-6 py-2 text-base font-medium rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeSection === 'subscription'
                ? 'text-white bg-brand-info hover:bg-brand-highlight focus:ring-brand-info'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
            }`}
          >
            {subscriptionSectionLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Se actualizează...
              </>
            ) : (
              'Gestionează Abonamentul'
            )}
          </button>
          
          <button
            onClick={() => setActiveSection('billing')}
            className={`inline-flex items-center px-6 py-2 text-base font-medium rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              activeSection === 'billing'
                ? 'text-white bg-brand-info hover:bg-brand-highlight focus:ring-brand-info'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
            }`}
          >
            Vezi istoricul facturilor
          </button>

          {subscription?.status === 'ACTIVE' && !subscription?.cancelAtPeriodEnd && (
            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Se anulează...
                </>
              ) : (
                'Anulează Abonamentul'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Visual Separator */}
      <hr className="my-6 border-gray-200" />

      {/* Subscription Management Section */}
      {activeSection === 'subscription' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Alege un plan potrivit pentru tine
          </h3>

          {subscriptionSectionLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-info mr-3" />
              <span className="text-lg text-gray-600">Se încarcă abonamentele...</span>
            </div>
          ) : tiers.length > 0 ? (
            <>
              {/* Toggle Switch - Pill Toggle Design */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gradient-to-r from-brand-info to-brand-highlight rounded-full p-1">
              <button
                onClick={() => setSelectedInterval('MONTHLY')}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedInterval === 'MONTHLY' 
                    ? 'bg-white text-brand-info shadow-sm' 
                    : 'bg-transparent text-white hover:text-gray-200'
                }`}
              >
                Lunar
              </button>
              <button
                onClick={() => setSelectedInterval('YEARLY')}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedInterval === 'YEARLY' 
                    ? 'bg-white text-brand-info shadow-sm' 
                    : 'bg-transparent text-white hover:text-gray-300'
                }`}
              >
                Anual
              </button>
            </div>
          </div>

          {selectedInterval === 'YEARLY' && (
            <div className="text-center mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                Economisești 2 luni
              </span>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col min-h-full ${
                  plan.isPopular 
                    ? 'border-2 border-gradient-to-r from-brand-info to-brand-highlight border-brand-info shadow-lg bg-white' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-info to-brand-highlight text-white text-sm font-semibold">
                      Recomandat
                    </span>
                  </div>
                )}
                
                <div className="text-center flex-grow flex flex-col">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.displayName}
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-lg text-gray-600 ml-2">
                      lei/{plan.interval === 'monthly' ? 'lună' : 'lună'}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                      TVA inclus
                    </div>
                    {plan.interval === 'yearly' && (
                      <div className="text-sm text-gray-500 mt-1">
                        Facturat anual ({Math.round(plan.price * 12)} lei/an)
                      </div>
                    )}
                    {plan.trialDays && plan.trialDays > 0 && !user && (
                      <div className="text-sm text-green-600 mt-1 font-medium">
                        + {plan.trialDays} zile trial gratuit
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-3 flex-grow">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-left">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Button at bottom */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={planLoading === plan.id}
                      className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info transition-colors ease-in-out duration-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-brand-info to-brand-highlight text-white shadow-md hover:bg-gradient-to-r hover:from-brand-highlight hover:to-brand-accent'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-brand-highlight hover:to-brand-accent hover:border-transparent hover:text-white'
                      }`}
                    >
                      {planLoading === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Se procesează...
                        </>
                      ) : (
                        `Alege - ${plan.displayName}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nu există planuri disponibile</h4>
              <p className="text-gray-600">
                Momentan nu sunt planuri de abonament disponibile.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Billing History Section */}
      {activeSection === 'billing' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Istoricul facturilor
          </h3>
          
          <div className="space-y-4">
            {/* Placeholder for billing history - you can replace this with actual data */}
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nu există facturi încă</h4>
              <p className="text-gray-600 mb-6">
                Când vei avea un abonament activ, facturile tale vor apărea aici.
              </p>
              <button
                onClick={() => setActiveSection('subscription')}
                className="inline-flex items-center px-6 py-2 text-base font-medium text-white bg-brand-info rounded-lg hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-brand-info transition-colors"
              >
                Alege un plan
              </button>
            </div>

            {/* Example billing history items - replace with real data */}
            {subscription?.status === 'ACTIVE' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Factura #001</p>
                      <p className="text-sm text-gray-600">
                        {subscription.tier?.displayName || 'Plan Pro'} - {subscription.tier?.interval === 'MONTHLY' ? 'Lunar' : 'Anual'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {subscription.tier?.price || '0'} lei
                    </p>
                    <p className="text-sm text-gray-600">
                      {subscription.currentPeriodStart ? formatDate(subscription.currentPeriodStart) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
