export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

export class SlidingWindowRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  check(key: string, now = Date.now()): RateLimitDecision {
    const cutoff = now - this.windowMs;
    const timestamps = (this.hits.get(key) ?? []).filter((ts) => ts > cutoff);

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldest + this.windowMs - now) / 1000),
      );
      this.hits.set(key, timestamps);
      return {
        allowed: false,
        retryAfterSeconds,
        remaining: 0,
      };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: Math.max(0, this.maxRequests - timestamps.length),
    };
  }
}
