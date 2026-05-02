import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const url = new URL(targetUrl);
    
    // Fetch the target URL
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch: ${response.status} ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    
    // We only want to proxy HTML pages this way. Other assets could theoretically be fetched directly if base tag works.
    if (contentType && contentType.includes('text/html')) {
      let html = await response.text();

      // Inject a <base> tag to fix relative links and assets
      const baseTag = `<base href="${url.origin}">`;
      
      // Inject a script to monkey-patch history API to prevent SecurityErrors
      const silenceScript = `
        <script>
          (function() {
            const wrap = (obj, prop) => {
              const original = obj[prop];
              obj[prop] = function() {
                try {
                  return original.apply(this, arguments);
                } catch (e) {
                  console.warn('Blocked ' + prop + ' to prevent SecurityError:', e.message);
                }
              };
            };
            wrap(window.history, 'pushState');
            wrap(window.history, 'replaceState');
          })();
        </script>
      `;
      
      // Attempt to inject right after <head>, fallback to start of document if no <head>
      if (html.toLowerCase().includes('<head>')) {
        html = html.replace(/<head>/i, `<head>${baseTag}${silenceScript}`);
      } else {
        html = baseTag + silenceScript + html;
      }

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          // We intentionally DO NOT include X-Frame-Options or Content-Security-Policy
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // For non-HTML data
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Internal Server Error fetching URL', { status: 500 });
  }
}
