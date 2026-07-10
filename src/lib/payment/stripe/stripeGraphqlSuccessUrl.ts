/**
 * Fallback pentru `stripeSuccessUrl` în GraphQL `startCheckout` dacă clientul nu trimite URL explicit.
 * Preferă URL-uri construite în browser (`buildStripeSuccessUrlForGraphQL` din `stripeClientCheckoutUrls.ts`).
 * Server: `STRIPE_SUCCESS_URL`. Client: `NEXT_PUBLIC_STRIPE_SUCCESS_URL`.
 */
export function getStripeSuccessUrlForGraphQL(): { stripeSuccessUrl?: string } {
  const isServer = typeof window === 'undefined';

  const success = isServer
    ? process.env.STRIPE_SUCCESS_URL?.trim() || process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL?.trim()
    : process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL?.trim();

  return success ? { stripeSuccessUrl: success } : {};
}
