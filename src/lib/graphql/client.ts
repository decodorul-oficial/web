import { GraphQLClient } from 'graphql-request';

export type GraphQLClientFactoryOptions = {
  endpoint?: string;
  getAuthToken?: () => Promise<string | undefined> | string | undefined;
};

const DEFAULT_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'https://decodorul-oficial-api.vercel.app/';

let singletonClient: GraphQLClient | null = null;

export function getGraphQLClient(options?: GraphQLClientFactoryOptions): GraphQLClient {
  if (typeof window !== 'undefined') {
    const token = undefined;
    return new GraphQLClient(options?.endpoint ?? DEFAULT_ENDPOINT, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  if (!singletonClient) {
    const tokenMaybe = options?.getAuthToken?.();
    const resolveToken = typeof tokenMaybe === 'string' || tokenMaybe === undefined ? tokenMaybe : undefined;
    singletonClient = new GraphQLClient(options?.endpoint ?? DEFAULT_ENDPOINT, {
      headers: resolveToken ? { Authorization: `Bearer ${resolveToken}` } : {}
    });
  }

  return singletonClient;
}


