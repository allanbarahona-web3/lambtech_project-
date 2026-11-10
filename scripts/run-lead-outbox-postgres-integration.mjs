import { spawn } from "node:child_process";
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiRoot = join(repositoryRoot, "apps", "api");
const expectedDatabase = "barmentech_lead_outbox_test";
const testUrl = process.env.LEAD_OUTBOX_TEST_DATABASE_URL;

function validateTestUrl(value) {
  if (!value) throw new Error("LEAD_OUTBOX_TEST_DATABASE_URL is required.");
  const url = new URL(value);
  const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);
  if (url.protocol !== "postgresql:" || !localHosts.has(url.hostname) || url.pathname !== `/${expectedDatabase}`) {
    throw new Error(`LEAD_OUTBOX_TEST_DATABASE_URL must target local ${expectedDatabase}.`);
  }
}

function run(command, arguments_, options) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, arguments_, options);
    child.once("error", rejectRun);
    child.once("close", (code, signal) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      rejectRun(new Error(`${basename(command)} exited with ${signal ?? `code ${code ?? "unknown"}`}.`));
    });
  });
}

function within(promise, milliseconds, fallback) {
  return new Promise((resolveWithin, rejectWithin) => {
    const timeout = setTimeout(() => resolveWithin(fallback), milliseconds);
    promise.then(
      (value) => { clearTimeout(timeout); resolveWithin(value); },
      (error) => { clearTimeout(timeout); rejectWithin(error); },
    );
  });
}

function lifecycleSummary(events, status) {
  return JSON.stringify({
    exitCode: status?.code ?? null,
    signal: status?.signal ?? null,
    lifecycle: events,
  });
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function findAvailablePort() {
  const server = createServer();
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  await new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()));
  if (!address || typeof address === "string") throw new Error("Unable to reserve an isolated API test port.");
  return address.port;
}

async function waitForHealth(port) {
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/v1/health`, {
        signal: AbortSignal.timeout(500),
      });
      if (response.status === 200) return true;
    } catch {
      // The compiled server may still be initializing.
    }
    await delay(100);
  }
  return false;
}

async function createCompiledApiShutdownProbe(temporaryRoot) {
  const markerPath = join(temporaryRoot, "compiled-api-shutdown.log");
  const probePath = join(temporaryRoot, "compiled-api-shutdown-probe.cjs");
  const prismaServicePath = join(apiRoot, "dist", "prisma", "prisma.service.js");
  await writeFile(
    probePath,
    `const { appendFileSync } = require("node:fs");
const { PrismaService } = require(${JSON.stringify(prismaServicePath)});
const markerPath = process.env.COMPILED_API_SHUTDOWN_MARKER;
const mark = (event) => appendFileSync(markerPath, event + "\\n");
process.once("SIGTERM", () => mark("sigterm_received"));
const originalDisconnect = PrismaService.prototype.$disconnect;
PrismaService.prototype.$disconnect = async function (...args) {
  try {
    return await originalDisconnect.apply(this, args);
  } finally {
    mark("prisma_disconnect_completed");
  }
};
`,
  );
  return { markerPath, probePath };
}

async function readShutdownEvents(markerPath) {
  try {
    return (await readFile(markerPath, "utf8"))
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function runCompiledApi(runtimeEnvironment, temporaryRoot) {
  const port = await findAvailablePort();
  const { markerPath, probePath } = await createCompiledApiShutdownProbe(temporaryRoot);
  const child = spawn(process.execPath, ["--require", probePath, join(apiRoot, "dist", "main.js")], {
    cwd: apiRoot,
    env: {
      ...runtimeEnvironment,
      COMPILED_API_SHUTDOWN_MARKER: markerPath,
      PORT: String(port),
      PUBLIC_WEB_ORIGINS: "http://localhost:3000,http://localhost:3002",
      PUBLIC_LEAD_SOURCE_SITE_ORIGINS: "http://localhost:3000=TECHNOLOGY,http://localhost:3002=FORMATION",
    },
    stdio: ["ignore", "ignore", "ignore"],
  });
  const exit = new Promise((resolveExit, rejectExit) => {
    child.once("error", rejectExit);
    child.once("close", (code, signal) => resolveExit({ code, signal }));
  });

  const healthy = await waitForHealth(port);
  if (!healthy) {
    child.kill("SIGTERM");
    const status = await within(exit, 5_000, undefined);
    throw new Error(`Compiled API did not become healthy: ${lifecycleSummary([], status)}`);
  }
  if (!child.kill("SIGTERM")) throw new Error("Unable to stop compiled API.");
  const status = await within(exit, 10_000, undefined);
  const events = await readShutdownEvents(markerPath);
  const shutdownCompleted = events.includes("sigterm_received") && events.includes("prisma_disconnect_completed");
  if (!status || status.code !== null || status.signal !== "SIGTERM" || !shutdownCompleted) {
    throw new Error(`Compiled API did not complete Nest shutdown: ${lifecycleSummary(events, status)}`);
  }
  console.log("Compiled API returned 200 from health and completed Nest shutdown without sending a public lead.");
}

async function runCompiledWorker(runtimeEnvironment) {
  if (Object.hasOwn(runtimeEnvironment, "MIGRATION_DATABASE_URL")) {
    throw new Error("Worker runtime must not receive MIGRATION_DATABASE_URL.");
  }
  const child = spawn(process.execPath, [join(apiRoot, "dist", "lead-email", "worker.js")], {
    cwd: apiRoot,
    env: runtimeEnvironment,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const events = [];
  let resolveReady;
  let rejectReady;
  let ready = false;
  const readiness = new Promise((resolveReadyPromise, rejectReadyPromise) => {
    resolveReady = resolveReadyPromise;
    rejectReady = rejectReadyPromise;
  });
  const recordLifecycle = (line) => {
    try {
      const candidate = JSON.parse(line);
      if (!candidate || typeof candidate.event !== "string" || !candidate.event.startsWith("lead_email_worker_")) return;
      const event = { event: candidate.event };
      if (candidate.signal === "SIGINT" || candidate.signal === "SIGTERM") event.signal = candidate.signal;
      if (typeof candidate.error === "string" && /^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(candidate.error)) event.error = candidate.error;
      events.push(event);
      if (event.event === "lead_email_worker_ready") {
        ready = true;
        resolveReady(true);
      }
    } catch {
      // Deliberately discard non-lifecycle output so diagnostics cannot expose configuration or user data.
    }
  };
  let buffered = "";
  const capture = (chunk) => {
    buffered += chunk.toString();
    let newline = buffered.indexOf("\n");
    while (newline >= 0) {
      recordLifecycle(buffered.slice(0, newline));
      buffered = buffered.slice(newline + 1);
      newline = buffered.indexOf("\n");
    }
  };
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);
  const exit = new Promise((resolveExit, rejectExit) => {
    child.once("error", (error) => {
      rejectReady(error);
      rejectExit(error);
    });
    child.once("close", (code, signal) => {
      const status = { code, signal };
      if (!ready) rejectReady(new Error(`Compiled worker exited before readiness: ${lifecycleSummary(events, status)}`));
      resolveExit(status);
    });
  });
  const becameReady = await within(readiness, 5_000, false);
  if (!becameReady) throw new Error(`Compiled worker did not become ready: ${lifecycleSummary(events)}`);
  if (!child.kill("SIGTERM")) throw new Error("Unable to send SIGTERM to compiled worker.");
  const stopped = await within(exit, 25_000, undefined);
  const expectedLifecycle = ["lead_email_worker_ready", "lead_email_worker_shutdown_started", "lead_email_worker_stopped"];
  const lifecycleComplete = expectedLifecycle.every((event) => events.some((candidate) => candidate.event === event));
  console.log(`Compiled worker lifecycle: ${lifecycleSummary(events, stopped)}`);
  if (!stopped || stopped.code !== 0 || stopped.signal !== null || !lifecycleComplete) {
    throw new Error(`Compiled worker did not shut down cleanly: ${lifecycleSummary(events, stopped)}`);
  }
}

validateTestUrl(testUrl);
const temporaryRoot = await mkdtemp(join(tmpdir(), "barmentech-lead-outbox-postgres-"));
const baseEnvironment = { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "" };
const migrationEnvironment = {
  ...baseEnvironment,
  NODE_ENV: "test",
  DATABASE_URL: testUrl,
  MIGRATION_DATABASE_URL: testUrl,
};
const runtimeEnvironment = {
  ...baseEnvironment,
  NODE_ENV: "test",
  DATABASE_URL: testUrl,
  LEAD_OUTBOX_TEST_DATABASE_URL: testUrl,
  LEAD_OUTBOX_POSTGRES_INTEGRATION: "1",
  LEAD_EMAIL_WORKER_POLL_INTERVAL_MS: "60000",
};

try {
  await cp(join(apiRoot, "prisma"), join(temporaryRoot, "prisma"), { recursive: true });
  await symlink(join(apiRoot, "node_modules"), join(temporaryRoot, "node_modules"), "dir");
  console.log(`Verified local test target: ${expectedDatabase}.`);
  await run(
    join(apiRoot, "node_modules", ".bin", "prisma"),
    ["migrate", "deploy", "--schema", join(temporaryRoot, "prisma", "schema.prisma")],
    { cwd: temporaryRoot, env: migrationEnvironment, stdio: "inherit" },
  );
  await run(join(apiRoot, "node_modules", ".bin", "nest"), ["build"], {
    cwd: apiRoot,
    env: runtimeEnvironment,
    stdio: "inherit",
  });
  await run(join(apiRoot, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.test.json"], {
    cwd: apiRoot,
    env: runtimeEnvironment,
    stdio: "inherit",
  });
  await run(process.execPath, ["--test", ".test-dist/lead-email/lead-email-worker.postgres.integration.spec.js", ".test-dist/privacy-requests/privacy-outbox.postgres.integration.spec.js"], {
    cwd: apiRoot,
    env: runtimeEnvironment,
    stdio: "inherit",
  });
  await runCompiledWorker(runtimeEnvironment);
  await runCompiledApi(runtimeEnvironment, temporaryRoot);
  console.log("PostgreSQL outbox integration and compiled-worker checks passed.");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
