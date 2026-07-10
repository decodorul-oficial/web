'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';
import {
  CHECKOUT_SUCCESS_PARAM,
  CHECKOUT_SUCCESS_VALUE,
  DEFAULT_POST_CHECKOUT_PATH
} from '@/lib/payment/stripe/stripeClientCheckoutUrls';

function StripeResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const nextAfterPay = searchParams.get('next') || DEFAULT_POST_CHECKOUT_PATH;
    const path = nextAfterPay.startsWith('/') ? nextAfterPay : `/${nextAfterPay}`;
    const destination = new URL(path, window.location.origin);
    destination.searchParams.set(CHECKOUT_SUCCESS_PARAM, CHECKOUT_SUCCESS_VALUE);

    if (sessionId || searchParams.get(CHECKOUT_SUCCESS_PARAM) === CHECKOUT_SUCCESS_VALUE) {
      router.replace(destination.pathname + destination.search);
      return;
    }

    router.replace('/profile');
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-info" />
      <p className="text-gray-600">Se finalizează plata…</p>
    </div>
  );
}

export default function StripeResultPage() {
  return (
    <>
      <Header />
      <main className="container-responsive py-12">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-brand-info" />
            </div>
          }
        >
          <StripeResultContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
