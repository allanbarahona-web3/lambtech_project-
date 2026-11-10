export type LeadEmailWorkerConfiguration = {
  leaseSeconds: number;
  maxAttempts: number;
  visitorConfirmationMaxPerRecipient: number;
  visitorConfirmationWindowSeconds: number;
  pollIntervalMs: number;
  sendTimeoutMs: number;
  shutdownTimeoutMs: number;
};

function integer(environment: NodeJS.ProcessEnv, name: string, fallback: number, minimum: number, maximum: number): number {
  const value = environment[name]?.trim();
  if (!value) return fallback;
  if (!/^\d+$/.test(value)) throw new Error(`${name} must be an integer.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) throw new Error(`${name} must be between ${minimum} and ${maximum}.`);
  return parsed;
}

export function getLeadEmailWorkerConfiguration(environment: NodeJS.ProcessEnv = process.env): LeadEmailWorkerConfiguration {
  const configuration = {
    pollIntervalMs: integer(environment, "LEAD_EMAIL_WORKER_POLL_INTERVAL_MS", 1_000, 100, 60_000),
    leaseSeconds: integer(environment, "LEAD_EMAIL_WORKER_LEASE_SECONDS", 60, 10, 900),
    sendTimeoutMs: integer(environment, "LEAD_EMAIL_WORKER_SEND_TIMEOUT_MS", 10_000, 1_000, 60_000),
    shutdownTimeoutMs: integer(environment, "LEAD_EMAIL_WORKER_SHUTDOWN_TIMEOUT_MS", 20_000, 1_000, 60_000),
    maxAttempts: integer(environment, "LEAD_EMAIL_WORKER_MAX_ATTEMPTS", 5, 1, 20),
    visitorConfirmationMaxPerRecipient: integer(environment, "LEAD_VISITOR_CONFIRMATION_MAX_PER_RECIPIENT", 3, 1, 20),
    visitorConfirmationWindowSeconds: integer(environment, "LEAD_VISITOR_CONFIRMATION_WINDOW_SECONDS", 86_400, 3_600, 604_800),
  };
  if (configuration.leaseSeconds * 1_000 <= configuration.sendTimeoutMs) {
    throw new Error("LEAD_EMAIL_WORKER_LEASE_SECONDS must exceed LEAD_EMAIL_WORKER_SEND_TIMEOUT_MS.");
  }
  return configuration;
}
