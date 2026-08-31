const LAST_CHAPTER_KEY = "mairin:lastChapter";
const COMPLETED_CHAPTERS_KEY = "mairin:completedChapters";
const SESSION_TOKEN_KEY = "mairin:sessionToken";

let inMemoryCompletedChapters: number[] | null = null;
let inMemorySessionToken: string | null = null;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function randomUuidV4(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

/**
 * Generates a v4 UUID. Prefers `crypto.randomUUID` (secure contexts) and falls
 * back to a `getRandomValues`-based implementation for non-secure origins
 * (e.g. the game served over plain HTTP in a container).
 */
export function createSessionToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return randomUuidV4();
}

/**
 * Reads the persisted session token. Returns null when missing or malformed,
 * or when storage is unavailable. In-memory fallback is used once storage has
 * been observed to fail.
 */
export function readSessionToken(): string | null {
  if (inMemorySessionToken !== null) {
    return inMemorySessionToken;
  }

  try {
    const raw = localStorage.getItem(SESSION_TOKEN_KEY);
    if (raw === null || !UUID_RE.test(raw)) {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

export function writeSessionToken(token: string): void {
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    inMemorySessionToken = token;
  }
}

/**
 * Returns the session token for this device, creating and persisting one when
 * none exists. The token is stable across page loads so the backend tracks a
 * single session per device.
 */
export function getOrCreateSessionToken(): string {
  const existing = readSessionToken();
  if (existing) {
    return existing;
  }
  const token = createSessionToken();
  writeSessionToken(token);
  return token;
}

export function __resetSessionTokenStorage(): void {
  inMemorySessionToken = null;
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Ignore private-mode errors.
  }
}

export function readLastChapter(): number | null {
  try {
    const raw = sessionStorage.getItem(LAST_CHAPTER_KEY);
    if (raw === null) {
      return null;
    }
    const index = Number.parseInt(raw, 10);
    if (!Number.isFinite(index) || index < 0) {
      return null;
    }
    return index;
  } catch {
    return null;
  }
}

export function writeLastChapter(index: number): void {
  try {
    sessionStorage.setItem(LAST_CHAPTER_KEY, String(index));
  } catch {
    // Ignore private-mode / quota errors so the UI never crashes.
  }
}

function normalizeCompletedChapters(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const valid = value.filter(
    (n): n is number =>
      typeof n === "number" && Number.isFinite(n) && n >= 0,
  );
  return Array.from(new Set(valid)).sort((a, b) => a - b);
}

/**
 * Reads the durable list of completed chapter indices from localStorage.
 * Returns an empty array when the value is missing or malformed, or when
 * storage is unavailable (private mode). In-memory fallback is used once
 * storage has been observed to fail.
 */
export function readCompletedChapters(): number[] {
  if (inMemoryCompletedChapters !== null) {
    return [...inMemoryCompletedChapters];
  }

  try {
    const raw = localStorage.getItem(COMPLETED_CHAPTERS_KEY);
    if (raw === null) {
      return [];
    }
    return normalizeCompletedChapters(JSON.parse(raw));
  } catch {
    inMemoryCompletedChapters = [];
    return [...inMemoryCompletedChapters];
  }
}

/**
 * Adds a chapter index to the durable completed list. Duplicate entries are
 * ignored and the stored array is kept sorted. If localStorage is unavailable,
 * the update is kept in memory for the current session.
 */
export function writeCompletedChapters(index: number): void {
  if (!Number.isFinite(index) || index < 0) {
    return;
  }

  try {
    const current = readCompletedChapters();
    const next = normalizeCompletedChapters([...current, index]);
    localStorage.setItem(COMPLETED_CHAPTERS_KEY, JSON.stringify(next));
  } catch {
    const current = inMemoryCompletedChapters ?? [];
    const next = normalizeCompletedChapters([...current, index]);
    inMemoryCompletedChapters = next;
  }
}

/**
 * Overwrites the durable completed list with an explicit set of indices.
 * Used when reconciling server-side progress into local storage.
 */
export function writeCompletedChaptersAll(indices: number[]): void {
  const next = normalizeCompletedChapters(indices);
  try {
    localStorage.setItem(COMPLETED_CHAPTERS_KEY, JSON.stringify(next));
  } catch {
    inMemoryCompletedChapters = next;
  }
}

/**
 * Resets the in-memory fallback used for completed chapters. Exposed only for
 * tests so each spec starts from a clean state.
 */
export function __resetCompletedStorage(): void {
  inMemoryCompletedChapters = null;
}

const INTRO_SEEN_KEY = "mairin:introSeen";

let inMemoryIntroSeen: boolean | null = null;

/**
 * Reads whether the player has already seen the intro.
 * Returns false when the value is missing or malformed, or when storage is
 * unavailable (private mode). In-memory fallback is used once storage has been
 * observed to fail.
 */
export function readIntroSeen(): boolean {
  if (inMemoryIntroSeen !== null) {
    return inMemoryIntroSeen;
  }

  try {
    const raw = localStorage.getItem(INTRO_SEEN_KEY);
    if (raw === null) {
      return false;
    }
    return raw === "true";
  } catch {
    inMemoryIntroSeen = false;
    return inMemoryIntroSeen;
  }
}

/**
 * Persists that the player has seen the intro. If localStorage is unavailable,
 * the flag is kept in memory for the current session.
 */
export function writeIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_SEEN_KEY, "true");
  } catch {
    inMemoryIntroSeen = true;
  }
}

/**
 * Resets the in-memory fallback used for the intro seen flag. Exposed only for
 * tests so each spec starts from a clean state.
 */
export function __resetIntroStorage(): void {
  inMemoryIntroSeen = null;
  try {
    localStorage.removeItem(INTRO_SEEN_KEY);
  } catch {
    // Ignore private-mode errors.
  }
}
