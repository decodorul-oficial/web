import { GraphQLClient } from 'graphql-request';

export type GraphQLClientFactoryOptions = {
  endpoint?: string;
  getAuthToken?: () => Promise<string | undefined> | string | undefined;
};

function normalizeEndpoint(input?: string) {
  const raw = input ?? process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'https://decodorul-oficial-api.vercel.app/api/graphql';
  // If a host or root is provided, attempt to resolve to a GraphQL path
  try {
    const url = new URL(raw);
    const path = url.pathname.replace(/\/?$/, '');
    if (path === '' || path === '/') {
      url.pathname = '/api/graphql';
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const DEFAULT_ENDPOINT = normalizeEndpoint();

let singletonClient: GraphQLClient | null = null;

export function getGraphQLClient(options?: GraphQLClientFactoryOptions): GraphQLClient {
  // Always create a new client on browser side for proper header management
  if (typeof window !== 'undefined') {
    const token = options?.getAuthToken?.();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    
    return new GraphQLClient(normalizeEndpoint(options?.endpoint), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...authHeaders
      }
    });
  }

  // Server side - use singleton but with proper headers
  if (!singletonClient) {
    const tokenMaybe = options?.getAuthToken?.();
    const resolveToken = typeof tokenMaybe === 'string' || tokenMaybe === undefined ? tokenMaybe : undefined;
    const authHeaders = resolveToken ? { Authorization: `Bearer ${resolveToken}` } : {};
    
    singletonClient = new GraphQLClient(normalizeEndpoint(options?.endpoint), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...authHeaders
      }
    });
  }

  return singletonClient;
}


