/**
 * Pure unlock rule for chapter progression.
 *
 * - Chapter 0 is always unlocked.
 * - Chapter n (n > 0) is unlocked iff chapter n - 1 has been completed.
 * - Out-of-range indices are never unlocked.
 */
export function isChapterUnlocked(
  index: number,
  completed: number[],
  total: number,
): boolean {
  if (index === 0) {
    return true;
  }
  if (index < 0 || index >= total) {
    return false;
  }
  return completed.includes(index - 1);
}
