/**
 * Kill-switch pentru plăți în UI (Stripe). Oglindă PAYMENTS_ENABLED din API.
 */
export function paymentsEnabledFromEnv(): boolean {
  const raw = process.env.PAYMENTS_ENABLED;
  if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
    return String(raw).toLowerCase() === 'true';
  }
  return process.env.NODE_ENV !== 'production';
}

export function paymentsEnabledFromPublicEnv(): boolean {
  const raw = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED;
  if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
    return String(raw).toLowerCase() === 'true';
  }
  return process.env.NODE_ENV !== 'production';
}

export function arePaymentsEnabledClient(): boolean {
  return typeof window === 'undefined'
    ? paymentsEnabledFromEnv()
    : paymentsEnabledFromPublicEnv();
}

export const PAYMENTS_DISABLED_MESSAGE =
  'Plățile online sunt temporar indisponibile. Poți explora planurile; revenim în curând.';
