import { NextRequest, NextResponse } from 'next/server';
import { normalizeAndValidateUrl } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    const norm = normalizeAndValidateUrl(url || '');
    if (!norm.valid || !norm.formattedUrl) {
      return NextResponse.json({
        valid: false,
        reachable: false,
        error: norm.error || 'Invalid website URL format.',
      }, { status: 400 });
    }

    const targetUrl = norm.formattedUrl;

    // Perform live HTTP reachability check with 4-second timeout
    let isReachable = false;
    let statusCode: number | undefined;
    let reachError: string | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(targetUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MarkMosaiq-Validator/1.0',
          'Accept': '*/*',
        },
      });
      clearTimeout(timeoutId);

      statusCode = res.status;
      // Any response (even 200, 301, 302, 401, 403, 404) proves the domain exists and the host is active
      isReachable = true;
    } catch (headErr: any) {
      // If HEAD was rejected (some servers block HEAD), try a quick GET
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const getRes = await fetch(targetUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MarkMosaiq-Validator/1.0',
          },
        });
        clearTimeout(timeoutId);
        statusCode = getRes.status;
        isReachable = true;
      } catch (getErr: any) {
        isReachable = false;
        reachError = getErr.name === 'AbortError'
          ? 'Website took too long to respond (timeout after 4s).'
          : 'Domain not found or unreachable. Please verify domain name spelling.';
      }
    }

    return NextResponse.json({
      valid: true,
      formattedUrl: targetUrl,
      hostname: norm.hostname,
      reachable: isReachable,
      status: statusCode,
      error: !isReachable ? reachError : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({
      valid: false,
      reachable: false,
      error: err.message || 'Error checking website existence.',
    }, { status: 500 });
  }
}
