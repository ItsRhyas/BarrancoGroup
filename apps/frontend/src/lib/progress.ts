import { levels } from "../game/levels";
import * as api from "./api";

/**
 * Maps server-side level ids ("level-1", "level-2", …) to their zero-based
 * chapter indices. Unknown ids are dropped so a stale server never unlocks
 * chapters that do not exist locally.
 */
export function serverLevelsToIndices(levelIds: string[]): number[] {
  return levelIds
    .map((id) => levels.findIndex((level) => level.id === id))
    .filter((index) => index >= 0);
}

export function levelIdForIndex(index: number): string | null {
  return levels[index]?.id ?? null;
}

/**
 * Fetches the completed levels for a session and returns them as chapter
 * indices.
 */
export async function hydrateProgress(sessionToken: string): Promise<number[]> {
  const { completedLevels } = await api.getProgress(sessionToken);
  return serverLevelsToIndices(completedLevels);
}

/**
 * Backfills the server with success attempts for chapters that are already
 * completed locally but missing server-side (e.g. finished offline before the
 * backend was reachable). Best-effort: network failures are swallowed so the
 * local progress is never lost.
 */
export async function backfillMissing(
  sessionToken: string,
  localCompleted: number[],
  serverCompleted: number[],
): Promise<void> {
  const serverSet = new Set(serverCompleted);
  for (const index of localCompleted) {
    if (serverSet.has(index)) {
      continue;
    }
    const levelId = levelIdForIndex(index);
    if (!levelId) {
      continue;
    }
    await api
      .recordAttempt({ sessionToken, levelId, success: true })
      .catch(() => {});
  }
}
