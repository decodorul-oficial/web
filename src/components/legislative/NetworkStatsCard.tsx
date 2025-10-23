'use client';

import React, { useMemo, useState } from 'react';
import { useGraphQL } from '@/hooks/useGraphQL';
import { GET_LEGISLATIVE_CONNECTION_STATS, GetLegislativeConnectionStatsResponse } from '@/features/news/graphql/legislativeNetworkQueries';
import { Link, BarChart3, Target, HelpCircle, BarChart2 } from 'lucide-react';

export function NetworkStatsCard() {
  // State pentru tooltip-uri
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Query pentru statisticile conexiunilor - fără variabile, deci nu va recrea hook-ul
  const { data, loading, error } = useGraphQL<GetLegislativeConnectionStatsResponse>(
    GET_LEGISLATIVE_CONNECTION_STATS,
    undefined, // Fără variabile
    { skip: false }
  );

  // Memoizează statisticile pentru a evita recalcularea
  const stats = useMemo(() => data?.getLegislativeConnectionStats, [data]);

  // Sortarea tipurilor de conexiuni după numărul de conexiuni - mutat la început
  const sortedConnectionsByType = useMemo(() => {
    if (!stats?.connectionsByType) return [];
    return Object.entries(stats.connectionsByType)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5); // Top 5 tipuri
  }, [stats?.connectionsByType]);

  // Formatarea încrederii medii ca procent - mutat la început
  const averageConfidencePercent = useMemo(() => {
    if (!stats?.averageConfidence) return 0;
    return Math.round(stats.averageConfidence * 100);
  }, [stats?.averageConfidence]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
          <span className="ml-2 text-gray-600">Se încarcă statisticile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-600">
          <p>Nu s-au putut încărca statisticile conexiunilor.</p>
          <p className="text-sm text-gray-500 mt-1">Încearcă din nou mai târziu.</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-600">
          <p>Nu există date disponibile pentru statistică.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart2 className="h-5 w-5 text-blue-600" />
        Statistici Conexiuni
      </h3>

      {/* Layout compact pentru sidebar */}
      <div className="space-y-3 mb-6">
        {/* Total Conexiuni */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-200 rounded-lg flex-shrink-0">
              <Link className="h-4 w-4 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-blue-800">Total Conexiuni</p>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  onMouseEnter={() => setActiveTooltip('total')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <HelpCircle className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xl font-bold text-blue-900">{stats.totalConnections}</p>
            </div>
          </div>
          
          {/* Tooltip pentru Total Conexiuni */}
          {activeTooltip === 'total' && (
            <div className="absolute left-0 right-0 top-full mt-2 z-10 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
              <div className="font-semibold mb-1">Ce înseamnă?</div>
              <p className="leading-relaxed">
                Reprezintă numărul total de legături legislative identificate între acest act normativ și alte documente. O valoare mai mare indică un act cu un grad ridicat de interconectivitate în rețeaua legislativă.
              </p>
              <div className="absolute -top-2 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          )}
        </div>

        {/* Încredere Medie */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-200 rounded-lg flex-shrink-0">
              <Target className="h-4 w-4 text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-green-800">Încredere Medie</p>
                <button
                  type="button"
                  className="text-green-600 hover:text-green-800 transition-colors"
                  onMouseEnter={() => setActiveTooltip('confidence')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <HelpCircle className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xl font-bold text-green-900">{averageConfidencePercent}%</p>
            </div>
          </div>
          
          {/* Tooltip pentru Încredere Medie */}
          {activeTooltip === 'confidence' && (
            <div className="absolute left-0 right-0 top-full mt-2 z-10 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
              <div className="font-semibold mb-1">Ce înseamnă?</div>
              <p className="leading-relaxed">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                Măsoară siguranța cu care sistemul AI a identificat aceste conexiuni. O legătură cu încredere de 80% sau mai mult este afișată ca o linie continuă pe hartă (conexiune explicită), în timp ce o valoare mai mică apare ca linie punctată (conexiune dedusă din context).
              </p>
              <div className="absolute -top-2 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          )}
        </div>

        {/* Tipuri de Conexiuni */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-200 rounded-lg flex-shrink-0">
              <BarChart3 className="h-4 w-4 text-purple-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-purple-800">Tipuri Conexiuni</p>
                <button
                  type="button"
                  className="text-purple-600 hover:text-purple-800 transition-colors"
                  onMouseEnter={() => setActiveTooltip('types')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <HelpCircle className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xl font-bold text-purple-900">{Object.keys(stats.connectionsByType).length}</p>
            </div>
          </div>
          
          {/* Tooltip pentru Tipuri Conexiuni */}
          {activeTooltip === 'types' && (
            <div className="absolute left-0 right-0 top-full mt-2 z-10 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
              <div className="font-semibold mb-1">Ce înseamnă?</div>
              <p className="leading-relaxed">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                Arată numărul de tipuri distincte de relații identificate (ex: &apos;modifică&apos;, &apos;abrogă&apos;, &apos;face referire la&apos;). O diversitate mai mare poate indica un impact complex al actului normativ.
              </p>
              <div className="absolute -top-2 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          )}
        </div>
      </div>

      {/* Top tipuri de conexiuni - compact */}
      {sortedConnectionsByType.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <h4 className="text-sm font-medium text-gray-700">Top Tipuri</h4>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onMouseEnter={() => setActiveTooltip('top-types')}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <HelpCircle className="h-3 w-3" />
              </button>
            </div>
            
            {/* Tooltip pentru Top Tipuri */}
            {activeTooltip === 'top-types' && (
              <div className="absolute left-0 right-0 top-full mt-2 z-10 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                <div className="font-semibold mb-1">Ce reprezintă această listă?</div>
                <p className="leading-relaxed">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  Detaliază numărul total de conexiuni, grupate după tipul relației. O mențiune &quot;(extern)&quot; indică o referință către un act normativ mai vechi, care nu se află încă în baza de date a Decodorului Oficial.
                </p>
                <div className="absolute -top-2 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {sortedConnectionsByType.map(([type, count], index) => (
              <div key={type} className="flex items-center justify-between py-2 px-2 bg-gray-50 rounded text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="flex-shrink-0 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 capitalize truncate">
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <span className="flex-shrink-0 ml-2 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-900">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
