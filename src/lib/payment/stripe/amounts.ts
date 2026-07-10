export function ronToBani(amountRon: number): number {
  // RON has 2 decimal places. Stripe expects smallest currency unit (int).
  return Math.round(amountRon * 100);
}

export function safeParseAmountRon(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim();
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/** Sumă în unități minore Stripe (ex. bani) → string în unitate majoră pentru GraphQL (ex. lei). */
export function majorAmountStringFromStripeMinor(
  minorAmount: number,
  currency: string | undefined
): string | undefined {
  if (!minorAmount || minorAmount <= 0) return undefined;
  const curr = (currency || '').toLowerCase();
  if (curr === 'ron' || curr === 'ronb') {
    return String(minorAmount / 100);
  }
  return String(minorAmount);
}

