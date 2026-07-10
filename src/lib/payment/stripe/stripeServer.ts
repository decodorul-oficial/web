import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Stripe server SDK — folosește doar `STRIPE_SECRET_KEY` în mediul unde rulează codul de server
 * (API Routes, Server Actions, etc.). În Next.js, variabilele fără prefixul `NEXT_PUBLIC_` nu sunt
 * incluse în bundle-ul de browser. Dacă UI-ul static e separat de API, această cheie trăiește doar
 * pe host-ul API, nu în env-ul clientului.
 */
export function getStripeServer(): Stripe {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  stripeInstance = new Stripe(secretKey);

  return stripeInstance;
}

