import { useState, useEffect, useCallback } from 'react';
import { getGraphQLClient } from '@/lib/graphql/client';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface AnalyticsData {
  totalActs: number;
  legislativeActivityOverTime: Array<{
    date: string;
    value: number;
  }>;
  topActiveMinistries: Array<{
    label: string;
    value: number;
  }>;
  distributionByCategory: Array<{
    label: string;
    value: number;
  }>;
  topKeywords: Array<{
    label: string;
    value: number;
  }>;
  topMentionedLaws: Array<{
    label: string;
    value: number;
  }>;
}

const GET_ANALYTICS_DASHBOARD = `
  query GetAnalyticsDashboard($startDate: String!, $endDate: String!) {
    getAnalyticsDashboard(startDate: $startDate, endDate: $endDate) {
      totalActs
      legislativeActivityOverTime {
        date
        value
      }
      topActiveMinistries {
        label
        value
      }
      distributionByCategory {
        label
        value
      }
      topKeywords {
        label
        value
      }
      topMentionedLaws {
        label
        value
      }
    }
  }
`;

export function useAnalyticsData(dateRange: DateRange) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const client = getGraphQLClient();
      const variables = {
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0],
      };

      const result = await client.request(GET_ANALYTICS_DASHBOARD, variables) as any;
      
      if (result.getAnalyticsDashboard) {
        setData(result.getAnalyticsDashboard);
      } else {
        throw new Error('Nu s-au putut prelua datele analitice');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
      
      // Fallback data pentru demo/development
      const fallbackData = {
        totalActs: 1247,
        legislativeActivityOverTime: [
          { date: '2024-01-01', value: 15 },
          { date: '2024-01-02', value: 23 },
          { date: '2024-01-03', value: 18 },
          { date: '2024-01-04', value: 31 },
          { date: '2024-01-05', value: 27 },
          { date: '2024-01-06', value: 19 },
          { date: '2024-01-07', value: 22 },
        ],
        topActiveMinistries: [
          { label: 'Ministerul Finanțelor', value: 156 },
          { label: 'Ministerul Sănătății', value: 134 },
          { label: 'Ministerul Educației', value: 98 },
          { label: 'Ministerul Transporturilor', value: 87 },
          { label: 'Ministerul Mediului', value: 76 },
        ],
        distributionByCategory: [
          { label: 'Hotărâri de Guvern', value: 45 },
          { label: 'Ordine Ministeriale', value: 28 },
          { label: 'Legi', value: 15 },
          { label: 'Ordonanțe de Urgență', value: 12 },
        ],
        topKeywords: [
          { label: 'buget', value: 89 },
          { label: 'sănătate', value: 67 },
          { label: 'educație', value: 54 },
          { label: 'transport', value: 43 },
          { label: 'mediu', value: 38 },
          { label: 'securitate', value: 32 },
          { label: 'cultură', value: 28 },
          { label: 'sport', value: 25 },
          { label: 'agricultură', value: 22 },
          { label: 'energie', value: 19 },
        ],
        topMentionedLaws: [
          { label: 'Codul Penal', value: 67 },
          { label: 'Codul Civil', value: 54 },
          { label: 'Codul Fiscal', value: 43 },
          { label: 'Codul Muncii', value: 38 },
          { label: 'Codul Administrativ', value: 32 },
        ],
      };
      
      
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}
