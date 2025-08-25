import { NextRequest, NextResponse } from 'next/server';

// Proxy GraphQL requests from the browser through the Next.js server
// Injects X-Internal-API-Key and forwards to the real GraphQL endpoint

export async function POST(req: NextRequest) {
  try {
    const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://decodorul-oficial-api.vercel.app/api/graphql';
    const body = await req.text();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (process.env.INTERNAL_API_KEY) {
      headers['X-Internal-API-Key'] = process.env.INTERNAL_API_KEY as string;
    }

    if (process.env.DEBUG_INTERNAL_API_KEY === 'true') {
      try {
        const opMatch = /\b(query|mutation)\s+(\w+)/.exec(body);
        const operationName = opMatch?.[2] ?? 'unknown';
        console.info('[GraphQL][S2S Debug][proxy] forwarding request', {
          endpoint,
          operationName,
          hasInternalKey: Boolean(process.env.INTERNAL_API_KEY),
          internalKeyLength: process.env.INTERNAL_API_KEY?.length ?? 0,
          headerNames: Object.keys(headers)
        });
      } catch {}
    }

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers,
      body
    });

    const resText = await upstream.text();
    return new NextResponse(resText, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json'
      }
    });
  } catch (err) {
    console.error('[GraphQL proxy] error forwarding request:', err);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}


