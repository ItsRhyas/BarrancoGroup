#!/usr/bin/env node
//
// One-command startup for the development environment (hybrid mode).
// Idempotent: safe to run multiple times; each step is skipped when already done.
//
// Usage: pnpm dev-startup
//
import { spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IS_WINDOWS = process.platform === "win32";

const COMPOSE = ["-f", "docker-compose.yml", "-f", "docker/compose/dev.yml"];

function run(cmd, args, { silent = false, shell = IS_WINDOWS } = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: silent ? ["ignore", "pipe", "pipe"] : "inherit",
      shell,
    });
    let output = "";
    if (silent) {
      child.stdout.on("data", (chunk) => (output += chunk));
      child.stderr.on("data", (chunk) => (output += chunk));
    }
    child.on("close", (code) => resolvePromise({ code, output }));
  });
}

async function ensureDb() {
  const up = await run("docker", ["compose", ...COMPOSE, "up", "-d", "db"], {
    silent: true,
    shell: false,
  });
  if (up.code !== 0) {
    process.stderr.write(up.output);
    process.stderr.write("Could not start the database. Is Docker running?\n");
    process.exit(up.code ?? 1);
  }

  const timeout = Date.now() + 60_000;
  while (Date.now() < timeout) {
    const ready = await run(
      "docker",
      [
        "compose",
        ...COMPOSE,
        "exec",
        "-T",
        "db",
        "sh",
        "-c",
        'pg_isready -U "$POSTGRES_USER"',
      ],
      { silent: true, shell: false },
    );
    if (ready.code === 0) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  process.stderr.write("PostgreSQL did not become ready in time.\n");
  process.exit(1);
}

async function main() {
  // 1. Environment: create .env on first run.
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) {
    copyFileSync(resolve(root, ".env.example"), envPath);
    console.log("[ok] Created .env from .env.example");
  } else {
    console.log("[ok] .env already exists");
  }

  // 2. Dependencies: install on first run (or when missing).
  if (!existsSync(resolve(root, "node_modules"))) {
    console.log("[..] Installing dependencies (pnpm install)...");
    const install = await run("pnpm", ["install"]);
    if (install.code !== 0) process.exit(install.code ?? 1);
  } else {
    console.log("[ok] Dependencies already installed");
  }

  // 3. Prisma client: regenerate (fast, ensures the client exists).
  console.log("[..] Generating Prisma client...");
  const generate = await run("pnpm", ["db:generate"]);
  if (generate.code !== 0) process.exit(generate.code ?? 1);

  // 4. Start db (Docker) and wait for it.
  await ensureDb();

  // 5. Run backend + frontend on the host (hybrid).
  const dev = spawn("pnpm", ["-r", "--parallel", "dev"], {
    cwd: root,
    stdio: "inherit",
    shell: IS_WINDOWS,
  });
  dev.on("close", (code) => process.exit(code ?? 0));
}

main();
