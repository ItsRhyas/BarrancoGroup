import { ApiError, login, register, setAccessToken } from "./api";

const USERNAME_KEY = "mairin:authUsername";
const PASSWORD_KEY = "mairin:authPassword";
const TOKEN_KEY = "mairin:authToken";

let inMemoryToken: string | null = null;

function randomHex(byteCount: number): string {
  const bytes = new Uint8Array(byteCount);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function generateUsername(): string {
  return `mairin-${randomHex(6)}`;
}

function generatePassword(): string {
  return randomHex(16);
}

function readStorage(key: string): string | null {
  try {
    const value = localStorage.getItem(key);
    return value === null || value === "" ? null : value;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore private-mode / quota errors.
  }
}

export interface Credentials {
  username: string;
  password: string;
}

function persistCredentials(credentials: Credentials): void {
  writeStorage(USERNAME_KEY, credentials.username);
  writeStorage(PASSWORD_KEY, credentials.password);
}

/**
 * Returns the anonymous credentials for this device, generating and persisting
 * a random username/password on first run. Progress is keyed by the session
 * token (not the auth account), so these credentials are disposable.
 */
export function getOrCreateCredentials(): Credentials {
  const username = readStorage(USERNAME_KEY);
  const password = readStorage(PASSWORD_KEY);
  if (username && password) {
    return { username, password };
  }
  const credentials = {
    username: generateUsername(),
    password: generatePassword(),
  };
  persistCredentials(credentials);
  return credentials;
}

export function readAccessToken(): string | null {
  if (inMemoryToken !== null) {
    return inMemoryToken;
  }
  return readStorage(TOKEN_KEY);
}

function writeAccessToken(token: string): void {
  inMemoryToken = token;
  writeStorage(TOKEN_KEY, token);
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

/**
 * Returns true when the JWT `exp` claim is in the past. Decode failures are
 * treated as "not expired" (we cannot tell) so a malformed token still gets
 * used and the server becomes the final authority.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return false;
    }
    const decoded = JSON.parse(base64UrlDecode(payload)) as { exp?: unknown };
    const exp = decoded.exp;
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

/**
 * Ensures a valid access token exists, silently registering an anonymous
 * account the first time. Resolves with the token and registers it in the API
 * layer so subsequent progress calls are authenticated. Throws only when the
 * backend is unreachable.
 */
export async function ensureAccessToken(): Promise<string> {
  const existing = readAccessToken();
  if (existing && !isTokenExpired(existing)) {
    setAccessToken(existing);
    return existing;
  }

  let credentials = getOrCreateCredentials();

  // Reuse credentials when they still work (e.g. token was lost but the
  // anonymous account already exists server-side).
  try {
    const result = await login(credentials.username, credentials.password);
    writeAccessToken(result.accessToken);
    setAccessToken(result.accessToken);
    return result.accessToken;
  } catch {
    // Fall through to register.
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await register(credentials.username, credentials.password);
      writeAccessToken(result.accessToken);
      setAccessToken(result.accessToken);
      return result.accessToken;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        credentials = {
          username: generateUsername(),
          password: credentials.password,
        };
        persistCredentials(credentials);
        continue;
      }
      throw error;
    }
  }

  throw new Error("No se pudo registrar la cuenta de juego");
}

export function __resetAuthStorage(): void {
  inMemoryToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(PASSWORD_KEY);
  } catch {
    // Ignore private-mode errors.
  }
}
