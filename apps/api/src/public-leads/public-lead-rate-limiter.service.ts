import { Injectable } from "@nestjs/common";

const DEFAULT_MAX_ATTEMPTS = 12;
const DEFAULT_WINDOW_SECONDS = 15 * 60;
const MAX_TRACKED_CLIENTS = 10_000;
const CAPACITY_RETRY_AFTER_SECONDS = 60;

type RateLimitEntry = {
  attempts: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function readInteger(name: string, fallback: number, minimum: number, maximum: number): number {
  const value = process.env[name]?.trim();
  if (!value) return fallback;
  if (!/^\d+$/.test(value)) throw new Error(`${name} must be an integer.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) throw new Error(`${name} must be between ${minimum} and ${maximum}.`);
  return parsed;
}

@Injectable()
export class PublicLeadRateLimiterService {
  private readonly entries = new Map<string, RateLimitEntry>();
  private readonly maxAttempts = readInteger("PUBLIC_LEAD_RATE_LIMIT_MAX_ATTEMPTS", DEFAULT_MAX_ATTEMPTS, 1, 50);
  private readonly windowMs = readInteger("PUBLIC_LEAD_RATE_LIMIT_WINDOW_SECONDS", DEFAULT_WINDOW_SECONDS, 60, 3_600) * 1_000;

  // This in-memory limiter requires exactly one API instance. Replace it with
  // centralized storage before horizontally scaled production use.
  consume(clientIp: string, now = Date.now()): RateLimitResult {
    this.removeExpiredEntries(now);

    const entry = this.entries.get(clientIp);
    if (!entry) {
      if (this.entries.size >= MAX_TRACKED_CLIENTS) {
        return {
          allowed: false,
          retryAfterSeconds: CAPACITY_RETRY_AFTER_SECONDS,
        };
      }

      this.entries.set(clientIp, {
        attempts: 1,
        resetAt: now + this.windowMs,
      });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (entry.attempts >= this.maxAttempts) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
      };
    }

    entry.attempts += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  private removeExpiredEntries(now: number): void {
    for (const [clientIp, entry] of this.entries) {
      if (entry.resetAt <= now) {
        this.entries.delete(clientIp);
      }
    }
  }
}
