import React from 'react';
import { getGraphQLClient } from '@/lib/graphql/client';

// Hook pentru a folosi GraphQL Client
export function useGraphQL<TData = unknown, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  options?: {
    skip?: boolean;
    pollInterval?: number;
  }
) {
  const [data, setData] = React.useState<TData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // Stabilizează query-ul și variabilele cu useMemo pentru a evita recrearea
  const stableQuery = React.useMemo(() => query, [query]);
  
  // Stabilizează variabilele pentru a evita re-executarea în buclă
  const stableVariables = React.useMemo(() => {
    // Dacă variables este undefined, returnează un obiect gol stabil
    if (variables === undefined) return {};
    // Dacă variables este un obiect, îl clonează pentru a evita mutările
    if (typeof variables === 'object' && variables !== null) {
      return { ...variables };
    }
    return variables;
  }, [variables]);
  const stableSkip = React.useMemo(() => Boolean(options?.skip), [options?.skip]);
  const stablePollInterval = React.useMemo(() => options?.pollInterval, [options?.pollInterval]);

  // Funcția fetchData stabilizată cu useCallback
  const fetchData = React.useCallback(async () => {
    if (stableSkip) return;

    setLoading(true);
    setError(null);

    try {
      const client = getGraphQLClient();
      const result = await client.request<TData>(
        stableQuery, 
        stableVariables as Record<string, unknown>
      );
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare GraphQL necunoscută';
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [stableQuery, stableVariables, stableSkip]);

  // Efect pentru fetch-ul inițial - rulează doar când se schimbă parametrii esențiali
  React.useEffect(() => {
    if (!stableSkip) {
      fetchData();
    }
  }, [stableSkip, fetchData]);

  // Polling pentru actualizări - folosește referințele pentru a evita recrearea
  React.useEffect(() => {
    if (!stablePollInterval) return;

    const interval = setInterval(() => {
      if (!stableSkip) {
        fetchData();
      }
    }, stablePollInterval);
    
    return () => clearInterval(interval);
  }, [stablePollInterval, stableSkip, fetchData]);

  // Funcția refetch stabilizată
  const refetch = React.useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
}

// Provider pentru GraphQL Client (pentru compatibilitate)
export function GraphQLProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Export client pentru compatibilitate
export { getGraphQLClient as client };
