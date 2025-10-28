'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchDocumentConnectionsByNews } from '@/features/news/services/newsService';
import type { DocumentConnectionView } from '@/features/news/types';

type DocumentConnectionsSectionProps = {
  newsId: string;
  relationType?: string;
  limit?: number;
};

export function DocumentConnectionsSection({ newsId, relationType, limit = 20 }: DocumentConnectionsSectionProps) {
  const { isAuthenticated, hasPremiumAccess, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<DocumentConnectionView[]>([]);

  const filter = useMemo(() => ({ relationType, limit }), [relationType, limit]);

  useEffect(() => {
    let isActive = true;
    const run = async () => {
      if (authLoading) return;
      if (!isAuthenticated || !hasPremiumAccess) return;
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchDocumentConnectionsByNews({
          newsId,
          relationType: filter.relationType,
          limit: filter.limit,
          offset: 0
        });
        if (!isActive) return;
        setConnections(rows);
      } catch (e) {
        if (!isActive) return;
        setError('A apărut o eroare la încărcarea conexiunilor documentului.');
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };
    run();
    return () => { isActive = false; };
  }, [newsId, filter, isAuthenticated, hasPremiumAccess, authLoading]);

  if (authLoading) {
    return (
      <div className="mt-8">
        <div className="animate-pulse h-24 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!isAuthenticated || !hasPremiumAccess) {
    return (
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Istoricul modificărilor legislative</h3>
            <p className="text-sm text-gray-600">Disponibil pentru utilizatori autentificați cu abonament activ sau în perioada de trial.</p>
          </div>
          <Link href="/preturi" className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-brand-info rounded hover:bg-brand-highlight">
            Activează Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Istoricul modificărilor legislative</h2>
        {relationType && (
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">Filtru: {relationType}</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="animate-pulse h-10 bg-gray-100 rounded" />
          <div className="animate-pulse h-10 bg-gray-100 rounded" />
          <div className="animate-pulse h-10 bg-gray-100 rounded" />
        </div>
      ) : error ? (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">{error}</div>
      ) : connections.length === 0 ? (
        <div className="p-3 bg-gray-50 text-gray-700 border border-gray-200 rounded text-sm">Nu au fost găsite conexiuni pentru acest document.</div>
      ) : (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200">
          {connections.map((c) => {
            const relation = c.tipRelatie;
            const targetTitle = c.cheieDocumentTinta || 'Document necunoscut';
            const hasTargetLink = !!c.idStireTinta;
            return (
              <li key={c.idConexiune} className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {relation}
                    </span>
                    {typeof c.confidenceScore === 'number' && (
                      <span className="text-xs text-gray-500">scor: {c.confidenceScore.toFixed(2)}</span>
                    )}
                    {c.extractionMethod && (
                      <span className="text-[10px] uppercase tracking-wide text-gray-500">{c.extractionMethod}</span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-900 truncate">
                    {hasTargetLink ? (
                      <Link href={`/stiri/${c.idStireTinta}`} className="text-brand-info hover:underline">
                        {targetTitle}
                      </Link>
                    ) : (
                      <span className="text-gray-800">{targetTitle}</span>
                    )}
                  </div>
                  {c.cheieDocumentSursa && (
                    <div className="text-xs text-gray-500 truncate">Sursă: {c.cheieDocumentSursa}</div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  {hasTargetLink ? (
                    <Link href={`/stiri/${c.idStireTinta}`} className="text-sm text-brand-info hover:underline">
                      Vezi știrea
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">extern</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}


