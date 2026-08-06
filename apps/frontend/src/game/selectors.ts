import type { BoardState } from "./types";

/**
 * Returns true when every scene slot has a placed scene and every nested
 * character slot has a placed character. Used to gate validation.
 */
export function isLevelComplete(board: BoardState): boolean {
  for (const slot of Object.values(board)) {
    if (slot.sceneId === null) {
      return false;
    }
    for (const characterId of Object.values(slot.characters)) {
      if (characterId === null) {
        return false;
      }
    }
  }
  return true;
}
