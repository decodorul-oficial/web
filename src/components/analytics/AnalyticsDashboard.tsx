'use client';

import { useState } from 'react';
import { DateRangeFilter } from './DateRangeFilter';
import { KPICard } from './KPICard';
import { LegislativeActivityChart } from './LegislativeActivityChart';
import { TopMinistriesChart } from './TopMinistriesChart';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { TopKeywordsChart } from './TopKeywordsChart';
import { TopMentionedLawsChart } from './TopMentionedLawsChart';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return { startDate, endDate };
  });

  const { data, loading, error, refetch } = useAnalyticsData(dateRange);

  const handleDateRangeChange = (newDateRange: { startDate: Date; endDate: Date }) => {
    setDateRange(newDateRange);
  };

  const handleApplyFilter = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-lg font-medium mb-2">
          Eroare la încărcarea datelor
        </div>
        <p className="text-red-500 mb-4">
          Nu s-au putut încărca datele analitice. Vă rugăm să încercați din nou.
        </p>
        <button
          onClick={() => refetch()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Încearcă din nou
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <DateRangeFilter
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onApplyFilter={handleApplyFilter}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Display */}
      {!loading && data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Acte Normative"
              value={data.totalActs}
              icon="FileText"
            />
            <KPICard
              title="Top Instituții Active"
              value={data.topActiveMinistries.length}
              icon="Building2"
            />
            <KPICard
              title="Categorii Legislative"
              value={data.distributionByCategory.length}
              icon="Tags"
            />
            <KPICard
              title="Cuvinte Cheie"
              value={data.topKeywords.length}
              icon="KeyRound"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Legislative Activity Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <LegislativeActivityChart data={data.legislativeActivityOverTime} />
            </div>

            {/* Top Ministries Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <TopMinistriesChart data={data.topActiveMinistries} />
            </div>

            {/* Category Distribution Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <CategoryDistributionChart data={data.distributionByCategory} />
            </div>

            {/* Top Keywords Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <TopKeywordsChart data={data.topKeywords} />
            </div>
            
            {/* Top Mentioned Laws Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <TopMentionedLawsChart data={data.topMentionedLaws} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
