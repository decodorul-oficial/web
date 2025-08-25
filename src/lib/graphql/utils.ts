import { GraphQLClient } from 'graphql-request';

export function toURL(input: string): URL | null {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

export function buildEndpointCandidates(rawInput?: string): string[] {
  const input = rawInput ?? process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'https://decodorul-oficial-api.vercel.app';
  const u = toURL(input);
  if (!u) return [input];

  const path = u.pathname.replace(/\/?$/, '');
  const base = `${u.protocol}//${u.host}`;

  const list = new Set<string>();

  if (path === '' || path === '/') {
    list.add(`${base}/api/graphql`);
    list.add(`${base}/graphql`);
  } else {
    list.add(`${base}${path}`);
    if (path.endsWith('/api/graphql')) list.add(`${base}/graphql`);
    else if (path.endsWith('/graphql')) list.add(`${base}/api/graphql`);
  }

  return Array.from(list);
}

export async function requestWithEndpointFallback<T>(
  query: string,
  variables?: Record<string, unknown>,
  endpointFromEnv?: string
): Promise<{ data: T; endpoint: string }> {
  const candidates = buildEndpointCandidates(endpointFromEnv);

  let lastError: unknown;
  for (const endpoint of candidates) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Inject internal API key for server-side requests
      if (typeof window === 'undefined' && process.env.INTERNAL_API_KEY) {
        headers['X-Internal-API-Key'] = process.env.INTERNAL_API_KEY as string;
      }

      const client = new GraphQLClient(endpoint, {
        headers,
      });
      const data = await client.request<T>(query, variables);
      if (process.env.NODE_ENV !== 'production') {
        console.info('[GraphQL] using endpoint:', endpoint);
      }
      return { data, endpoint };
    } catch (err: any) {
      lastError = err;
      // retry on 404 or network errors; otherwise rethrow
      const status = err?.response?.status;
      if (status && status !== 404) {
        break;
      }
    }
  }
  throw lastError;
}


