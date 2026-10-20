/**
 * In-memory & Redis-ready rate limiter for security critical endpoints (MM-113).
 * Tracks rate limit buckets with sliding window and automatic expiration.
 */

interface RateLimitBucket {
  count: number;
  resetAt: number; // Unix timestamp in ms
}

const memoryRateLimitStore = new Map<string, RateLimitBucket>();

export interface RateLimitOptions {
  limit: number; // max allowed calls
  windowSeconds: number; // sliding window duration in seconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // in ms
  retryAfterSeconds?: number;
}

/**
 * Checks and increments the rate limit for a specific identifier (IP address, user ID, email).
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = memoryRateLimitStore.get(key);

  if (!bucket || now > bucket.resetAt) {
    // New or expired bucket
    const resetAt = now + options.windowSeconds * 1000;
    memoryRateLimitStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetAt,
    };
  }

  if (bucket.count >= options.limit) {
    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  bucket.count++;
  return {
    allowed: true,
    remaining: options.limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

/**
 * Helper to extract client IP address from Next.js request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Resets memory store (for testing purposes).
 */
export function _resetRateLimitStore(): void {
  memoryRateLimitStore.clear();
}
