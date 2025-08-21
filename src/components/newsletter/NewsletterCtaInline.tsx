'use client';

import { Mail } from 'lucide-react';
import { useNewsletterContext } from './NewsletterProvider';

export function NewsletterCtaInline() {
  const { showNewsletterModal } = useNewsletterContext();
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Mail className="h-4 w-4 text-brand-accent" />
        <span>Primește cele mai noi acte și decizii direct pe email</span>
      </div>
      <button
        type="button"
        onClick={showNewsletterModal}
        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-800 hover:bg-gray-100 hover:border-gray-400 transition-colors whitespace-nowrap"
      >
        Abonează-te
      </button>
    </div>
  );
}


