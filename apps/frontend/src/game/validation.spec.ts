import { describe, expect, it } from "vitest";
import { validate } from "./validation";
import { levels } from "./levels";
import { createInitialBoard } from "./reducer";
import type { BoardState } from "./types";

function fillBoard(
  levelId: string,
  sceneSlotId: string,
  sceneId: string,
  characters: Record<string, string>,
): BoardState {
  const level = levels.find((l) => l.id === levelId);
  if (!level) {
    throw new Error(`level not found: ${levelId}`);
  }
  const board = createInitialBoard(level);
  board[sceneSlotId] = {
    sceneId,
    characters: {
      ...board[sceneSlotId].characters,
      ...characters,
    },
  };
  return board;
}

describe("validate", () => {
  for (const level of levels) {
    describe(`level ${level.id}`, () => {
      const [sceneSlotId] = Object.keys(level.expected.scenes);
      const sceneId = level.expected.scenes[sceneSlotId];

      it("returns the correct ending for the expected solution", () => {
        const board = fillBoard(level.id, sceneSlotId, sceneId, level.expected.characters);
        const result = validate(board, level.expected, level.endings);
        expect(result.correct).toBe(true);
        expect(result.endingId).toBe(level.expected.correctEndingId);
      });

      it("returns an incorrect ending when the combination differs", () => {
        const wrongCharacters = Object.fromEntries(
          Object.entries(level.expected.characters).map(([slotId]) => [
            slotId,
            level.characters.find((c) => c.id !== level.expected.characters[slotId])!.id,
          ]),
        );
        const board = fillBoard(level.id, sceneSlotId, sceneId, wrongCharacters);
        const result = validate(board, level.expected, level.endings);
        expect(result.correct).toBe(false);
        expect(level.endings.find((e) => e.id === result.endingId)?.type).toBe("incorrect");
      });

      it("returns an incorrect ending when the wrong scene is placed", () => {
        // Levels currently define a single scene, so use a scene id that
        // cannot match the expected solution.
        const wrongScene = "scene:not-in-level";
        const board = fillBoard(level.id, sceneSlotId, wrongScene, level.expected.characters);
        const result = validate(board, level.expected, level.endings);
        expect(result.correct).toBe(false);
      });
    });
  }

  it("throws when a scene slot is empty", () => {
    const level = levels[0];
    const board = createInitialBoard(level);
    expect(() => validate(board, level.expected, level.endings)).toThrow(
      "should not be called with empty scene slots",
    );
  });

  it("throws when a character slot is empty", () => {
    const level = levels[0];
    const [sceneSlotId] = Object.keys(level.expected.scenes);
    const board = fillBoard(level.id, sceneSlotId, level.expected.scenes[sceneSlotId], {});
    expect(() => validate(board, level.expected, level.endings)).toThrow(
      "should not be called with empty character slots",
    );
  });

  it("throws when the level has no incorrect ending", () => {
    const level = levels[0];
    const [sceneSlotId] = Object.keys(level.expected.scenes);
    const board = fillBoard(level.id, sceneSlotId, "scene:other", level.expected.characters);
    const endingsWithoutIncorrect = level.endings.filter((e) => e.type === "correct");
    expect(() => validate(board, level.expected, endingsWithoutIncorrect)).toThrow(
      "missing an incorrect ending",
    );
  });
});
