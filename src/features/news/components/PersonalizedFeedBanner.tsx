'use client';

import Link from 'next/link';
import { Settings, Combine } from 'lucide-react';

interface PersonalizedFeedBannerProps {
  hasPreferences: boolean;
}

export function PersonalizedFeedBanner({ hasPreferences }: PersonalizedFeedBannerProps) {
  return (
    <div className="bg-gradient-to-r from-brand-info/10 to-brand-accent/10 border border-brand-info/20 rounded-lg px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Combine className="h-4 w-4 text-brand-info" />
            <h2 className="text-base font-semibold text-brand-accent">Știri</h2>
          </div>
          {hasPreferences ? (
            <>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-info/20 text-brand-accent">
                Personalizate
              </span>
              <span className="text-sm text-brand-accent/70">
                Acum vezi știri relevante din categoriile tale de interes
              </span>
            </>
          ) : (
            <>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-info/20 text-brand-accent">
                Ne-personalizate
              </span>
            <span className="text-sm text-brand-accent/70">
              Vrei să vezi doar știri relevante?
            </span>
            </>
          )}
        </div>
        <Link
          href="/profile/preferences"
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-accent bg-white/80 border border-brand-info/30 rounded-md hover:bg-brand-info/10 hover:border-brand-info/50 transition-colors"
          title="Personalizează preferințele"
        >
          <Settings className="h-3 w-3" />
          {hasPreferences ? (
            <span className="hidden sm:inline">Modifică</span>
          ) : (
            <span className="hidden sm:inline">Personalizează</span>
          )}
        </Link>
      </div>
    </div>
  );
}
