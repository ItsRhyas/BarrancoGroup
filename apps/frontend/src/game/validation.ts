import type { BoardState, Ending, ExpectedSolution, ValidationResult } from "./types";

/**
 * Pure validation function. Returns the correct ending when the player's
 * full combination matches the expected solution; otherwise returns the first
 * available incorrect ending. The function never mutates inputs and has no
 * side effects, so it can be unit-tested without React or DnD dependencies.
 */
export function validate(
  board: BoardState,
  expected: ExpectedSolution,
  endings: Ending[],
): ValidationResult {
  const placedSceneIds = Object.values(board).map((slot) => slot.sceneId);
  const placedCharacterIds = Object.values(board).flatMap((slot) =>
    Object.values(slot.characters),
  );

  if (placedSceneIds.some((id) => id === null)) {
    throw new Error("Validation should not be called with empty scene slots");
  }
  if (placedCharacterIds.some((id) => id === null)) {
    throw new Error("Validation should not be called with empty character slots");
  }

  const sceneMatch = Object.entries(expected.scenes).every(
    ([sceneSlotId, sceneId]) => board[sceneSlotId]?.sceneId === sceneId,
  );

  const characterMatch = Object.entries(expected.characters).every(
    ([charSlotId, characterId]) =>
      Object.values(board).some((slot) => slot.characters[charSlotId] === characterId),
  );

  if (sceneMatch && characterMatch) {
    return { correct: true, endingId: expected.correctEndingId };
  }

  const incorrectEnding = endings.find((ending) => ending.type === "incorrect");
  if (!incorrectEnding) {
    throw new Error("Level is missing an incorrect ending");
  }

  return { correct: false, endingId: incorrectEnding.id };
}
