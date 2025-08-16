import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Validate that the URL is from monitoruloficial.ro
    if (!url.startsWith('https://monitoruloficial.ro/')) {
      return NextResponse.json({ error: 'Invalid URL domain' }, { status: 400 });
    }

    // Fetch the content from Monitorul Oficial with proper headers
    // Optimizat pentru a fi mai rapid
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://monitoruloficial.ro/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    
    // If it's a PDF, return it directly
    if (contentType?.includes('application/pdf')) {
      const pdfBuffer = await response.arrayBuffer();
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline',
        },
      });
    }

    // For HTML content, return it as is
    const html = await response.text();
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error fetching from Monitorul Oficial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
