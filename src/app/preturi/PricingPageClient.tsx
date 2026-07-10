'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import PricingSection from '@/components/subscription/PricingSection';
import { TrialStatusBanner } from '@/components/ui/TrialStatusBanner';
import { paymentProcessor } from '@/features/subscription/services/paymentProcessor';
import { arePaymentsEnabledClient, PAYMENTS_DISABLED_MESSAGE } from '@/lib/payment/paymentsEnabled';

export function PricingPageClient() {
  const { isAuthenticated, trialStatus, hasPremiumAccess, user } = useAuth();

  const handleManageSubscription = async () => {
    if (!arePaymentsEnabledClient()) {
      alert(PAYMENTS_DISABLED_MESSAGE);
      return;
    }
    try {
      const result = await paymentProcessor.getCustomerPortalUrl({
        returnUrl: `${window.location.origin}/profile`
      });

      window.location.href = result.portal_url;
    } catch (e) {
      console.error(e);
      alert('Eroare la deschiderea Gestionării Abonamentului.');
    }
  };

  return (
    <>
      {/* Trial Status Banner */}
      <TrialStatusBanner />

      {/* Pricing Cards */}
      <PricingSection />

      {/* CTA Section with dynamic content */}
      <section className="py-8 bg-gradient-to-r from-brand-info to-brand-accent">
        <div className="container-responsive text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Gata să începi?
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Alătură-te miilor de utilizatori care deja beneficiază de funcționalitățile premium
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!isAuthenticated ? (
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-brand-accent rounded-lg text-base font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Începe trial-ul gratuit de 14 zile
              </Link>
            ) : !hasPremiumAccess ? (
              <Link
                href="/profile"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-brand-accent rounded-lg text-base font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Upgrade la Pro
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleManageSubscription}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-brand-accent rounded-lg text-base font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Gestionare Abonament
              </button>
            )}
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-white text-white rounded-lg text-base font-semibold hover:bg-white hover:text-brand-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
            >
              Contactează-ne
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
