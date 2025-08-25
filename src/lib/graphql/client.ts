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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return new GraphQLClient(normalizeEndpoint(options?.endpoint), {
      headers
    });
  }

  // Server side - use singleton but with proper headers
  if (!singletonClient) {
    const tokenMaybe = options?.getAuthToken?.();
    const resolveToken = typeof tokenMaybe === 'string' || tokenMaybe === undefined ? tokenMaybe : undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (resolveToken) {
      headers.Authorization = `Bearer ${resolveToken}`;
    }
    
    // Inject internal API key for server-side requests
    if (process.env.INTERNAL_API_KEY) {
      headers['X-Internal-API-Key'] = process.env.INTERNAL_API_KEY as string;
    }
    
    const endpoint = normalizeEndpoint(options?.endpoint);
    const client = new GraphQLClient(endpoint, {
      headers
    });

    // Conditional debug logging just before each request
    if (process.env.DEBUG_INTERNAL_API_KEY === 'true') {
      const originalRequest = client.request.bind(client) as (
        query: any,
        variables?: Record<string, unknown>,
        requestHeaders?: HeadersInit
      ) => Promise<any>;

      (client as any).request = async (
        query: any,
        variables?: Record<string, unknown>,
        requestHeaders?: HeadersInit
      ) => {
        try {
          const isServer = typeof window === 'undefined';
          const keyPresent = Boolean(process.env.INTERNAL_API_KEY);
          const keyLength = process.env.INTERNAL_API_KEY?.length ?? 0;
          const opMatch = typeof query === 'string' ? /\b(query|mutation)\s+(\w+)/.exec(query) : null;
          const operationName = opMatch?.[2] ?? 'unknown';
          const headerNames = Object.keys(headers);

          // Do not log the actual key; only presence and length
          console.info('[GraphQL][S2S Debug] sending request', {
            runtime: isServer ? 'server' : 'browser',
            endpoint,
            operationName,
            hasInternalKey: keyPresent,
            internalKeyLength: keyLength,
            headerNames
          });
        } catch {
          // no-op
        }
        return originalRequest(query, variables, requestHeaders);
      };
    }

    singletonClient = client;
  }

  return singletonClient;
}


