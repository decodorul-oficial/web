'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LegislativeNetworkSection } from './LegislativeNetworkSection';

interface AuthenticatedLegislativeNetworkSectionProps {
  documentId: string;
}

export function AuthenticatedLegislativeNetworkSection({ documentId }: AuthenticatedLegislativeNetworkSectionProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Harta Conexiunilor Legislative
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render the section if user is not authenticated
  if (!user) {
    return (
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Harta Conexiunilor Legislative
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-brand-info/10 to-brand-accent/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acces Restricționat
              </h3>
              <p className="text-gray-600 mb-4">
                Harta Conexiunilor Legislative este disponibilă doar pentru utilizatorii autentificați.
              </p>
              <div className="space-y-3">
                <a
                  href="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent border border-transparent rounded-md hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info transition-colors"
                >
                  Autentificare
                </a>
                <div className="text-xs text-gray-500">
                  <a 
                    href="/preturi" 
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-brand-info border border-brand-info rounded-md hover:bg-brand-info/5 transition-colors"
                  >
                    Descoperă planurile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render the full legislative network section for authenticated users
  //return <LegislativeNetworkSection documentId={documentId} />;
  return (
    <section className="py-6 bg-gray-50">
      <LegislativeNetworkSection documentId={documentId} />
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Harta Conexiunilor Legislative
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-brand-info/10 to-brand-accent/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Funcționalitate în lucru
            </h3>
            <p className="text-gray-600 mb-4">
              Harta Conexiunilor Legislative va fi disponibilă în curând. Lucrăm la dezvoltarea acestei funcționalități pentru a vă oferi o perspectivă vizuală asupra relațiilor dintre acte normative, inițiatori și instituții.
            </p>
            <div className="space-y-3">
              <div className="text-xs text-gray-500">
                Dacă ai sugestii sau vrei să fii notificat când lansăm această funcționalitate, <a href="mailto:contact@decodoruloficial.ro" className="text-brand-info hover:text-brand-accent underline">scrie-ne</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
