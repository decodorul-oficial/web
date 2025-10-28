'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import PricingSection from '@/components/subscription/PricingSection';
import { TrialStatusBanner } from '@/components/ui/TrialStatusBanner';

export function PricingPageClient() {
  const { isAuthenticated, trialStatus, hasPremiumAccess } = useAuth();

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
              <Link
                href="/profile"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-brand-accent rounded-lg text-base font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Gestionează abonamentul
              </Link>
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
