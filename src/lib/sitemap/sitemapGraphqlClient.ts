import { GraphQLClient } from 'graphql-request';
import { getServerGraphQLClientWithInternalKey } from '@/lib/graphql/client';

/**
 * GraphQL client for sitemap generation (server-only).
 * Requires INTERNAL_API_KEY and EXTERNAL_GRAPHQL_ENDPOINT on Vercel.
 */
export function getSitemapGraphQLClient(): GraphQLClient {
  const client = getServerGraphQLClientWithInternalKey();
  if (!client) {
    throw new Error(
      'INTERNAL_API_KEY lipsește — sitemap-urile nu pot încărca știrile. ' +
        'Setează aceeași cheie ca pe API (min. 32 caractere) în proiectul web Vercel.',
    );
  }
  return client;
}
