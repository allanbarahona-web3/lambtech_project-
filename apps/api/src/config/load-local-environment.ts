import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

/**
 * Loads the API's ignored local configuration when it is present.
 *
 * The path is anchored to this package instead of the process working
 * directory, so it works both through `pnpm --filter` and from a built API.
 * Variables supplied by the shell or deployment remain authoritative.
 */
export function loadLocalEnvironment(): void {
  const path = resolve(__dirname, "../..", ".env");

  if (existsSync(path)) {
    loadEnvFile(path);
  }
}
