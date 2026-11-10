import { cp, mkdir, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiRoot = join(repositoryRoot, "apps", "api");
const temporaryRoot = await mkdtemp(join(tmpdir(), "barmentech-prisma-generate-"));

function run(command, arguments_, options) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, arguments_, options);
    child.once("error", rejectRun);
    child.once("exit", (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }

      rejectRun(new Error(`${basename(command)} exited with code ${code ?? "unknown"}.`));
    });
  });
}

try {
  await mkdir(join(temporaryRoot, "prisma"), { recursive: true });
  await cp(
    join(apiRoot, "prisma", "schema.prisma"),
    join(temporaryRoot, "prisma", "schema.prisma"),
  );
  await symlink(join(apiRoot, "node_modules"), join(temporaryRoot, "node_modules"), "dir");

  await run(
    join(apiRoot, "node_modules", ".bin", "prisma"),
    ["generate", "--schema", join(temporaryRoot, "prisma", "schema.prisma")],
    {
      cwd: temporaryRoot,
      env: {
        PATH: process.env.PATH ?? "",
        NODE_ENV: "production",
        PRISMA_GENERATE_SKIP_AUTOINSTALL: "true",
        DATABASE_URL: "postgresql://placeholder:placeholder@127.0.0.1:1/placeholder",
        MIGRATION_DATABASE_URL: "postgresql://placeholder:placeholder@127.0.0.1:1/placeholder",
      },
      stdio: "inherit",
    },
  );

  console.log("Isolated Prisma client generation passed.");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
