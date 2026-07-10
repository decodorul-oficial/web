import type { NextRequest } from 'next/server';
import { getStripeSuccessUrlForGraphQL } from '@/lib/payment/stripe/stripeGraphqlSuccessUrl';
import { buildStripeSuccessUrlForGraphQL } from '@/lib/payment/stripe/stripeClientCheckoutUrls';

export function getRequestOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin');
  if (origin?.trim()) return origin.replace(/\/$/, '');
  const base = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, '');
  return base || null;
}

/**
 * URL final pentru GraphQL `stripeSuccessUrl`: body de la client (același origin), apoi env, apoi `/profile?checkout=success`.
 */
export function resolveStripeSuccessUrlForCheckout(
  request: NextRequest,
  clientProvided?: string | null
): string | undefined {
  const origin = getRequestOrigin(request);

  if (clientProvided?.trim()) {
    try {
      const u = new URL(clientProvided.trim());
      if (!origin || u.origin === new URL(origin).origin) {
        return u.toString();
      }
    } catch {
      /* fall through */
    }
  }

  const envUrl = getStripeSuccessUrlForGraphQL().stripeSuccessUrl;
  if (envUrl) return envUrl;
  if (origin) return buildStripeSuccessUrlForGraphQL(origin);
  return undefined;
}
