import { Injectable } from "@nestjs/common";

type Entry = { attempts: number; resetAt: number };
const MAX_TRACKED_CLIENTS = 10_000;
const CAPACITY_RETRY_AFTER_SECONDS = 60;
@Injectable()
export class PrivacyRequestRateLimiterService {
  private readonly entries = new Map<string, Entry>();
  // This in-memory limiter requires exactly one API instance. Centralize it
  // before horizontally scaled production use.
  consume(ip: string, now = Date.now()) {
    for (const [key, entry] of this.entries) if (entry.resetAt <= now) this.entries.delete(key);
    const key = `privacy:${ip}`; const current = this.entries.get(key);
    if (!current) {
      if (this.entries.size >= MAX_TRACKED_CLIENTS) {
        return { allowed: false, retryAfterSeconds: CAPACITY_RETRY_AFTER_SECONDS };
      }
      this.entries.set(key, { attempts: 1, resetAt: now + 15 * 60_000 }); return { allowed: true, retryAfterSeconds: 0 };
    }
    if (current.attempts >= 3) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
    current.attempts += 1; return { allowed: true, retryAfterSeconds: 0 };
  }
}
