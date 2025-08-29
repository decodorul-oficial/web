'use client';

import { Suspense } from 'react';
import { LatestNewsSection } from './LatestNewsSection';

function LatestNewsSectionWithParamsInner() {
  return <LatestNewsSection />;
}

export function LatestNewsSectionWithParams() {
  return (
    <Suspense fallback={
      <div className="text-center py-8">
        <div className="text-gray-500">Se încarcă...</div>
      </div>
    }>
      <LatestNewsSectionWithParamsInner />
    </Suspense>
  );
}
