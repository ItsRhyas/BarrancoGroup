import { spawn } from "node:child_process";

const COMPOSE = ["-f", "docker-compose.yml", "-f", "docker/compose/dev.yml"];

function run(cmd, args, silent) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      stdio: silent ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let output = "";
    if (silent) {
      child.stdout.on("data", (d) => (output += d));
      child.stderr.on("data", (d) => (output += d));
    }
    child.on("close", (code) => resolve({ code, output }));
  });
}

async function ensureDb() {
  const up = await run("docker", ["compose", ...COMPOSE, "up", "-d", "db"], true);
  if (up.code !== 0) {
    process.stderr.write(up.output);
    process.stderr.write("Could not start the database. Is Docker running?\n");
    process.exit(up.code ?? 1);
  }

  const timeout = Date.now() + 60_000;
  while (Date.now() < timeout) {
    const ready = await run(
      "docker",
      ["compose", ...COMPOSE, "exec", "-T", "db", "sh", "-c", 'pg_isready -U "$POSTGRES_USER"'],
      true,
    );
    if (ready.code === 0) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  process.stderr.write("PostgreSQL did not become ready in time.\n");
  process.exit(1);
}

await ensureDb();

const dev = spawn("pnpm", ["-r", "--parallel", "dev"], { stdio: "inherit" });
dev.on("close", (code) => process.exit(code ?? 0));
