import { checkRateLimit, _resetRateLimitStore } from '../rateLimit';

describe('rateLimit helper (MM-113)', () => {
  beforeEach(() => {
    _resetRateLimitStore();
  });

  it('allows calls within the limit', () => {
    const res1 = checkRateLimit('user-1', { limit: 3, windowSeconds: 60 });
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit('user-1', { limit: 3, windowSeconds: 60 });
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);
  });

  it('blocks calls exceeding the limit and returns retryAfterSeconds', () => {
    checkRateLimit('ip-1', { limit: 2, windowSeconds: 60 });
    checkRateLimit('ip-1', { limit: 2, windowSeconds: 60 });

    const blocked = checkRateLimit('ip-1', { limit: 2, windowSeconds: 60 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
