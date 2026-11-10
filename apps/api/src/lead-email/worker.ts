import { NestFactory } from "@nestjs/core";

import { LeadEmailWorkerModule } from "./lead-email-worker.module";
import { LeadEmailWorkerService } from "./lead-email-worker.service";

type LifecycleEvent = {
  event: string;
  signal?: "SIGINT" | "SIGTERM";
  error?: string;
};

function lifecycle(event: LifecycleEvent): void {
  process.stdout.write(`${JSON.stringify(event)}\n`);
}

function errorName(error: unknown): string {
  return error instanceof Error && /^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(error.name)
    ? error.name
    : "UnknownError";
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(LeadEmailWorkerModule);
  const worker = app.get(LeadEmailWorkerService);
  let shutdown: Promise<void> | undefined;

  const close = (signal: "SIGINT" | "SIGTERM"): Promise<void> => {
    shutdown ??= (async () => {
      lifecycle({ event: "lead_email_worker_shutdown_started", signal });
      try {
        const idle = await worker.stop();
        await app.close();
        if (!idle) {
          lifecycle({ event: "lead_email_worker_shutdown_failed", error: "ActiveWorkTimeout" });
          process.exitCode = 1;
          return;
        }
        lifecycle({ event: "lead_email_worker_stopped", signal });
      } catch (error) {
        lifecycle({ event: "lead_email_worker_shutdown_failed", error: errorName(error) });
        process.exitCode = 1;
      }
    })();
    return shutdown;
  };

  process.once("SIGTERM", () => { void close("SIGTERM"); });
  process.once("SIGINT", () => { void close("SIGINT"); });
  lifecycle({ event: "lead_email_worker_ready" });
}

void bootstrap().catch((error: unknown) => {
  lifecycle({ event: "lead_email_worker_bootstrap_failed", error: errorName(error) });
  process.exitCode = 1;
});
