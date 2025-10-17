'use client';

import React, { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GraphQLProvider } from '@/hooks/useGraphQL';

// Import dinamic pentru componentele client-side cu loading optimizat
const LegislativeNetworkGraph = dynamic(
  () => import('./LegislativeNetworkGraph').then(mod => ({ default: mod.LegislativeNetworkGraph })), 
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
);

const NetworkStatsCard = dynamic(
  () => import('./NetworkStatsCard').then(mod => ({ default: mod.NetworkStatsCard })), 
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
);

interface LegislativeNetworkSectionProps {
  documentId: string;
}

export function LegislativeNetworkSection({ documentId }: LegislativeNetworkSectionProps) {
  // Memoizează documentId pentru a evita recrearea componentei
  const stableDocumentId = useMemo(() => documentId, [documentId]);

  return (
    <GraphQLProvider>
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Harta Conexiunilor Legislative
          </h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
            {/* Graful principal */}
            <div className="xl:col-span-3">
              <Suspense fallback={
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                </div>
              }>
                <LegislativeNetworkGraph documentId={stableDocumentId} />
              </Suspense>
            </div>
            
            {/* Statistici */}
            <div className="xl:col-span-1">
              <Suspense fallback={
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              }>
                <NetworkStatsCard />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </GraphQLProvider>
  );
}
