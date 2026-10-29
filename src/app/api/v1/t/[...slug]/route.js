/**
 * ColdMail Website Tracking Queue — Next.js App Router Handler
 *
 * Place this file in your Next.js project at:
 *   src/app/api/v1/t/[...slug]/route.js
 *
 * Set environment variable in Next.js (.env / .env.local):
 *   TRACKING_QUEUE_SECRET="coldmail-queue-secret-2026"
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

const PRIMARY_QUEUE_FILE = process.env.TRACKING_QUEUE_FILE || path.join(process.cwd(), 'tracking-queue.json');
const FALLBACK_QUEUE_FILE = path.join(os.tmpdir(), 'tracking-queue.json');
const QUEUE_SECRET = process.env.TRACKING_QUEUE_SECRET || 'coldmail-queue-secret-2026';

let memoryQueue = [];

const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

function readQueue() {
  for (const file of [PRIMARY_QUEUE_FILE, FALLBACK_QUEUE_FILE]) {
    try {
      if (fs.existsSync(file)) {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
        if (Array.isArray(parsed)) {
          memoryQueue = parsed;
          return parsed;
        }
      }
    } catch {
      // Try next fallback
    }
  }
  return memoryQueue;
}

function writeQueue(events) {
  const sliced = events.slice(-5000);
  memoryQueue = sliced;
  const payload = JSON.stringify(sliced, null, 2);

  try {
    fs.writeFileSync(PRIMARY_QUEUE_FILE, payload, 'utf8');
    return;
  } catch {
    try {
      fs.writeFileSync(FALLBACK_QUEUE_FILE, payload, 'utf8');
    } catch (err) {
      console.error('[ColdMail Queue] Write error:', err.message);
    }
  }
}

function enqueueEvent(eventData) {
  const queue = readQueue();
  queue.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...eventData,
  });
  writeQueue(queue);
}

function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : null;
}

function appendTokenToUrl(rawUrl, token) {
  const dest = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  try {
    const parsed = new URL(dest);
    if (!parsed.searchParams.has('_ct')) {
      parsed.searchParams.set('_ct', token);
    }
    return parsed.toString();
  } catch {
    return dest;
  }
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug || [];
    const action = slug[0];
    const param = slug[1] || '';

    // 1. Open Pixel: /api/v1/t/open/<token>.png
    if (action === 'open') {
      const token = param.replace(/\.png$/i, '');
      if (token) {
        enqueueEvent({
          token,
          event_type: 'open',
          ip_address: getClientIp(request),
          user_agent: request.headers.get('user-agent') || '',
        });
      }
      return new NextResponse(TRANSPARENT_GIF, {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // 2. Click Redirect: /api/v1/t/click/<token>?url=...
    if (action === 'click') {
      const token = param;
      const urlObj = new URL(request.url);
      const targetUrl = urlObj.searchParams.get('url') || '/';

      if (token) {
        enqueueEvent({
          token,
          event_type: 'click',
          url: targetUrl,
          ip_address: getClientIp(request),
          user_agent: request.headers.get('user-agent') || '',
        });
      }

      const redirectUrl = appendTokenToUrl(targetUrl, token);
      const response = NextResponse.redirect(redirectUrl, 302);
      if (token) {
        response.cookies.set('ct_token', token, {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
          sameSite: 'lax',
        });
      }
      return response;
    }

    // 3. Poll Queue: /api/v1/t/queue
    if (action === 'queue') {
      const secret = request.headers.get('x-queue-secret');
      if (secret !== QUEUE_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ events: readQueue() });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug || [];
    const action = slug.join('/');

    // 4. Website Page Views & Button Clicks: POST /api/v1/t/web-event
    if (action === 'web-event') {
      const body = await request.json();
      if (!body?.token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
      }
      enqueueEvent({
        token: body.token,
        event_type: body.event_type || 'page_view',
        url: body.url || '',
        element_text: body.element_text || null,
        page_title: body.page_title || null,
        ip_address: getClientIp(request),
        user_agent: request.headers.get('user-agent') || '',
      });
      return NextResponse.json({ status: 'queued' });
    }

    // 5. Acknowledge Synced Events: POST /api/v1/t/queue/ack
    if (action === 'queue/ack') {
      const secret = request.headers.get('x-queue-secret');
      if (secret !== QUEUE_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const body = await request.json();
      const ackIds = new Set(body?.ids || []);
      const remaining = readQueue().filter((ev) => !ackIds.has(ev.id));
      writeQueue(remaining);
      return NextResponse.json({ status: 'acknowledged', remaining: remaining.length });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

