"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { subscriptionService } from '@/features/subscription/services/subscriptionService';
import { Zap, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SubscriptionTier } from '@/features/subscription/types';

function PricingSection() {
  const { user } = useAuth();
  const router = useRouter();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        console.log('Fetching subscription tiers...');
        setTiersLoading(true);
        setError(null);
        const data = await subscriptionService.getSubscriptionTiers();
        console.log('Fetched tiers:', data);
        setTiers(data);
      } catch (err) {
        console.error('Error fetching tiers:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription tiers'));
      } finally {
        setTiersLoading(false);
      }
    };

    fetchTiers();
  }, []);


  const handleSelectPlan = async (tierId: string, interval: 'monthly' | 'yearly') => {
    if (!user) {
      router.push('/login?redirect=/preturi');
      return;
    }

    try {
      setLoading(tierId);
      
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
      setLoading(null);
    }
  };

  if (tiersLoading) {
    return (
      <section className="py-8">
        <div className="container-responsive">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-info" />
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">Se încarcă planurile de abonament...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <div className="container-responsive">
          <div className="text-center">
            <p className="text-red-600">Eroare la încărcarea planurilor: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  // Filter and format plans from API
  const plans = tiers
    .filter(tier => tier.isActive && tier.name !== 'free' && tier.interval === selectedInterval)
    .map(tier => ({
      ...tier,
      interval: tier.interval.toLowerCase() as 'monthly' | 'yearly',
      isPopular: tier.isPopular || false
    }))
    .sort((a, b) => a.price - b.price);

  if (plans.length === 0) {
    return (
      <section className="py-8">
        <div className="container-responsive">
          <div className="text-center">
            <p className="text-gray-600">Nu sunt disponibile planuri de abonament în acest moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container-responsive">
        {/* Toggle Switch */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gradient-to-r from-brand-info/10 to-brand-accent/10 border border-brand-info/20 rounded-full p-1">
            <button
              onClick={() => setSelectedInterval('MONTHLY')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedInterval === 'MONTHLY' 
                  ? 'bg-brand-info text-white shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lunar
            </button>
            <button
              onClick={() => setSelectedInterval('YEARLY')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedInterval === 'YEARLY' 
                  ? 'bg-brand-info text-white shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Anual (2 luni gratuite)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div
          className={
            plans.length === 1
              ? "flex justify-center max-w-2xl mx-auto"
              : plans.length === 2
              ? "grid gap-6 max-w-3xl mx-auto md:grid-cols-2"
              : "grid gap-6 max-w-4xl mx-auto md:grid-cols-2"
          }
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col ${
                plan.isPopular ? 'border-2 border-brand-info shadow-lg' : 'border-gray-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-info to-brand-accent text-white text-sm font-semibold">
                    <Zap className="w-4 h-4 mr-1" />
                    Cel mai popular
                  </span>
                </div>
              )}
              
              <div className="text-center flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.displayName}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
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

                <div className="mb-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Button at bottom */}
              <div className="mt-auto">
                <button
                  onClick={() => handleSelectPlan(plan.id, plan.interval)}
                  disabled={loading === plan.id}
                  className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-brand-info to-brand-accent text-white hover:from-brand-info/90 hover:to-brand-accent/90'
                      : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Se procesează...
                    </>
                  ) : plan.interval === 'monthly' ? (
                    `Alege - ${plan.displayName}`
                  ) : (
                    `Alege - ${plan.displayName}`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Legal Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Prin continuare, confirmi că ai citit și ești de acord cu{' '}
            <a href="/legal" className="text-brand-info hover:text-brand-accent underline">
              Termenii și Condițiile
            </a>{' '}
            și{' '}
            <a href="/privacy" className="text-brand-info hover:text-brand-accent underline">
              Politica de Confidențialitate
            </a>
            . De asemenea, confirmi că ai luat la cunoștință{' '}
            <a href="/legal#returns" className="text-brand-info hover:text-brand-accent underline">
              politica de retur de 14 zile
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
