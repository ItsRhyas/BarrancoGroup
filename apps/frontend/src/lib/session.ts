const LAST_CHAPTER_KEY = "mairin:lastChapter";
const COMPLETED_CHAPTERS_KEY = "mairin:completedChapters";

let inMemoryCompletedChapters: number[] | null = null;

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
 * Resets the in-memory fallback used for completed chapters. Exposed only for
 * tests so each spec starts from a clean state.
 */
export function __resetCompletedStorage(): void {
  inMemoryCompletedChapters = null;
}
