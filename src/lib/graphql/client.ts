import { GraphQLClient } from 'graphql-request';

export type GraphQLClientFactoryOptions = {
  endpoint?: string;
  getAuthToken?: () => Promise<string | undefined> | string | undefined;
  additionalHeaders?: Record<string, string>;
};

const normalizeEndpoint = (endpoint?: string): string => {
  const raw = endpoint ?? process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'https://decodorul-oficial-api.vercel.app/api/graphql';
  if (raw.startsWith('http')) {
    return raw;
  }
  return raw;
}

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
    
    // Adaugă header-uri suplimentare (ex: X-Captcha-Token)
    if (options?.additionalHeaders) {
      Object.assign(headers, options.additionalHeaders);
    }

    // Use the configured GraphQL endpoint from environment variables or options
    const browserEndpoint = options?.endpoint ?? process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? '/api/graphql';
    const absoluteBrowserEndpoint = browserEndpoint.startsWith('http')
      ? browserEndpoint
      : `${window.location.origin}${browserEndpoint}`;
    
    return new GraphQLClient(absoluteBrowserEndpoint, {
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
    
    // Adaugă header-uri suplimentare (ex: X-Captcha-Token)
    if (options?.additionalHeaders) {
      Object.assign(headers, options.additionalHeaders);
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
      const originalRequest = client.request.bind(client);
      
      // Override the request method for debugging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).request = async (
        query: string,
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


