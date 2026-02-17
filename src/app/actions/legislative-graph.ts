'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getGraphQLClient } from '@/lib/graphql/client';
import { GET_LEGISLATIVE_GRAPH } from '@/features/news/graphql/queries';
import { LegislativeGraphParams, LegislativeGraphResponse } from '@/features/news/types';

export async function getLegislativeGraphAction(params: LegislativeGraphParams) {
  try {
    // 1. Obținem sesiunea utilizatorului pe server
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // 2. Creăm clientul GraphQL cu token-ul de autentificare (dacă există)
    // getGraphQLClient va injecta automat și INTERNAL_API_KEY pe server
    const client = getGraphQLClient({
      getAuthToken: () => token
    });

    // 3. Executăm request-ul
    const data = await client.request<LegislativeGraphResponse>(
      GET_LEGISLATIVE_GRAPH,
      params
    );

    return { data: data.getLegislativeGraph, error: null };
  } catch (error: any) {
    console.error('Server Action Error fetching legislative graph:', error);
    
    // Verificăm erorile specifice de autentificare
    if (error?.response?.errors) {
        const authError = error.response.errors.find((e: any) => 
          e.extensions?.code === 'UNAUTHENTICATED' || 
          e.message.includes('Utilizator neautentificat') ||
          e.message.includes('Active subscription or trial required')
        );
        
        if (authError) {
          return { data: null, error: 'UNAUTHENTICATED' };
        }
    }
    
    if (error.message === 'UNAUTHENTICATED') {
      return { data: null, error: 'UNAUTHENTICATED' };
    }
    
    return { data: null, error: 'Failed to fetch graph data' };
  }
}
