import type { Metadata } from 'next';
import StiriSearchClient from './StiriSearchClient';

type StiriSearchParams = {
  keywords?: string;
  query?: string;
  page?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
};

function hasSearchFilters(params: StiriSearchParams): boolean {
  const page = Number(params.page || '1');
  return Boolean(
    params.keywords ||
      params.query ||
      params.dateFrom ||
      params.dateTo ||
      params.category ||
      (Number.isFinite(page) && page > 1),
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: StiriSearchParams;
}): Promise<Metadata> {
  const filtered = hasSearchFilters(searchParams);

  if (filtered) {
    return {
      title: 'Căutare Știri',
      description:
        'Caută și filtrează știrile legislative din Monitorul Oficial al României.',
      robots: {
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
        },
      },
    };
  }

  return {
    title: 'Căutare Avansată Știri Legislative',
    description:
      'Caută și filtrează știrile legislative din Monitorul Oficial al României. Căutare avansată după cuvinte cheie, perioade și categorii.',
    alternates: {
      canonical: '/stiri',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default function StiriPage() {
  return <StiriSearchClient />;
}
