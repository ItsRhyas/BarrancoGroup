import { spawn } from "node:child_process";

function startDb() {
  return new Promise((resolve) => {
    const db = spawn(
      "docker",
      ["compose", "-f", "docker-compose.yml", "-f", "docker/compose/dev.yml", "up", "-d", "db"],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    let output = "";
    db.stdout.on("data", (chunk) => (output += chunk));
    db.stderr.on("data", (chunk) => (output += chunk));
    db.on("close", (code) => resolve({ code, output }));
  });
}

const db = await startDb();
if (db.code !== 0) {
  process.stderr.write(db.output);
  process.stderr.write("Could not start the database. Is Docker running?\n");
  process.exit(db.code ?? 1);
}

const dev = spawn("pnpm", ["-r", "--parallel", "dev"], { stdio: "inherit" });
dev.on("close", (code) => process.exit(code ?? 0));
