import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

let loaded = false;

export function loadEnv(): void {
  if (loaded) {
    return;
  }
  loaded = true;

  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const envPath = findMonorepoEnvPath();
  if (!envPath) {
    return;
  }

  try {
    process.loadEnvFile(envPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

function findMonorepoEnvPath(): string | undefined {
  let current = process.cwd();
  const root = resolve(current, '/');

  while (current !== root) {
    if (existsSync(resolve(current, 'pnpm-workspace.yaml'))) {
      return resolve(current, '.env');
    }
    current = dirname(current);
  }

  return undefined;
}
