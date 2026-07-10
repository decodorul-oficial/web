export function getExternalGraphQLEndpoint(): string {
  return (
    process.env.EXTERNAL_GRAPHQL_ENDPOINT ||
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
    'https://decodorul-oficial-api.vercel.app/api/graphql'
  );
}

export async function updateOrderStatusExternalGraphQL(params: {
  orderId: string;
  status: string;
  transactionId?: string;
  amount?: string;
  currency?: string;
  rawData: Record<string, unknown>;
}): Promise<void> {
  const endpoint = getExternalGraphQLEndpoint();

  const mutation = `
    mutation UpdateOrderStatus($orderId: ID!, $status: String!, $transactionId: String, $amount: String, $currency: String, $rawData: JSON) {
      updateOrderStatus(
        orderId: $orderId
        status: $status
        transactionId: $transactionId
        amount: $amount
        currency: $currency
        rawData: $rawData
      ) {
        success
        message
        order {
          id
          status
          amount
          currency
          updatedAt
        }
      }
    }
  `;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  if (process.env.INTERNAL_API_KEY) {
    headers['X-Internal-API-Key'] = process.env.INTERNAL_API_KEY;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: mutation,
      variables: {
        orderId: params.orderId,
        status: params.status,
        transactionId: params.transactionId,
        amount: params.amount,
        currency: params.currency,
        rawData: params.rawData
      }
    })
  });

  const result = await response.json();
  const ok = response.ok && result?.data?.updateOrderStatus?.success === true;
  if (!ok) {
    const err =
      result?.errors?.[0]?.message ||
      result?.data?.updateOrderStatus?.message ||
      'GraphQL updateOrderStatus failed';
    throw new Error(err);
  }
}
