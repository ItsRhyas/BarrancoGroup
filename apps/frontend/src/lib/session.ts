const STORAGE_KEY = "mairin:lastChapter";

export function readLastChapter(): number | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
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
    sessionStorage.setItem(STORAGE_KEY, String(index));
  } catch {
    // Ignore private-mode / quota errors so the UI never crashes.
  }
}
