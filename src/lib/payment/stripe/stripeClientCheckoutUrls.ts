/**
 * URL-uri folosite în browser pentru fluxul Stripe (Payment Element).
 * `return_url` trebuie să ducă prin `/payment/stripe-result` (procesează query Stripe).
 * `stripeSuccessUrl` spre GraphQL = destinația finală după succes (profil + query pentru refresh UI).
 */

export const DEFAULT_POST_CHECKOUT_PATH = '/profile';
export const CHECKOUT_SUCCESS_PARAM = 'checkout';
export const CHECKOUT_SUCCESS_VALUE = 'success';

/** URL la care Stripe redirecționează după 3DS; include `next` = pagina finală. */
export function buildStripePaymentReturnUrl(origin: string, nextPath: string = DEFAULT_POST_CHECKOUT_PATH): string {
  const base = origin.replace(/\/$/, '');
  const path = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  return `${base}/payment/stripe-result?next=${encodeURIComponent(path)}`;
}

/** Trimis la GraphQL `startCheckout.stripeSuccessUrl` — unde ajunge utilizatorul după plată reușită. */
export function buildStripeSuccessUrlForGraphQL(origin: string, nextPath: string = DEFAULT_POST_CHECKOUT_PATH): string {
  const base = origin.replace(/\/$/, '');
  const path = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  const url = new URL(path, base);
  url.searchParams.set(CHECKOUT_SUCCESS_PARAM, CHECKOUT_SUCCESS_VALUE);
  return url.toString();
}
