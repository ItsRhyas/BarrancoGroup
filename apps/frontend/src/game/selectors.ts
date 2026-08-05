import type { BoardState, CharacterSlotDef, Level } from "./types";

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

/**
 * Returns the character slot definitions that are currently active for a
 * scene slot. Active slots come from the scene the player actually placed,
 * so the engine remains generic even if the player chose an unexpected scene.
 */
export function getActiveCharacterSlots(
  level: Level,
  board: BoardState,
  sceneSlotId: string,
): CharacterSlotDef[] {
  const sceneId = board[sceneSlotId]?.sceneId;
  if (!sceneId) {
    return [];
  }
  const scene = level.scenes.find((s) => s.id === sceneId);
  return scene?.characterSlots ?? [];
}
