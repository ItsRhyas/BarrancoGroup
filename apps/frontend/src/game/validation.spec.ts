import { describe, expect, it } from "vitest";
import { validate } from "./validation";
import { levels } from "./levels";
import { createInitialBoard } from "./reducer";
import type { BoardState } from "./types";

function fillLevelBoard(
  levelId: string,
  overrides: {
    scenes?: Record<string, string>;
    characters?: Record<string, string | null>;
  } = {},
): BoardState {
  const level = levels.find((l) => l.id === levelId);
  if (!level) {
    throw new Error(`level not found: ${levelId}`);
  }
  const board = createInitialBoard(level);
  for (const [sceneSlotId, sceneId] of Object.entries(level.expected.scenes)) {
    const expectedScene = level.scenes.find((s) => s.id === sceneId);
    if (!expectedScene) {
      throw new Error(`scene not found: ${sceneId}`);
    }
    const actualSceneId = overrides.scenes?.[sceneSlotId] ?? sceneId;
    const characters: Record<string, string | null> = {};
    for (const charSlot of expectedScene.characterSlots) {
      const expectedCharId = level.expected.characters[charSlot.id];
      const overrideCharId = overrides.characters?.[charSlot.id];
      characters[charSlot.id] =
        overrideCharId !== undefined ? overrideCharId : (expectedCharId ?? null);
    }
    board[sceneSlotId] = { sceneId: actualSceneId, characters };
  }
  return board;
}

describe("validate", () => {
  for (const level of levels) {
    describe(`level ${level.id}`, () => {
      it("returns the correct ending for the expected solution", () => {
        const board = fillLevelBoard(level.id);
        const result = validate(board, level.expected, level.endings);
        expect(result.correct).toBe(true);
        expect(result.endingId).toBe(level.expected.correctEndingId);
      });

      it("returns an incorrect ending when the combination differs", () => {
        const wrongCharacters: Record<string, string> = {};
        for (const [charSlotId, expectedCharId] of Object.entries(
          level.expected.characters,
        )) {
          const other = level.characters.find((c) => c.id !== expectedCharId);
          if (!other) {
            throw new Error(
              `level ${level.id} needs at least two characters to build a wrong combination`,
            );
          }
          wrongCharacters[charSlotId] = other.id;
        }
        const board = fillLevelBoard(level.id, { characters: wrongCharacters });
        const result = validate(board, level.expected, level.endings);
        expect(result.correct).toBe(false);
        expect(
          level.endings.find((e) => e.id === result.endingId)?.type,
        ).toBe("incorrect");
      });

      it("returns an incorrect ending when any scene is wrong", () => {
        const [sceneSlotId] = Object.keys(level.expected.scenes);
        const board = fillLevelBoard(level.id, {
          scenes: { [sceneSlotId]: "scene:not-in-level" },
        });
        const result = validate(board, level.expected, level.endings);
        expect(result.correct).toBe(false);
        expect(
          level.endings.find((e) => e.id === result.endingId)?.type,
        ).toBe("incorrect");
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
    const expectedSceneId = level.expected.scenes[sceneSlotId];
    const expectedScene = level.scenes.find((s) => s.id === expectedSceneId)!;
    const [charSlotId] = expectedScene.characterSlots.map((s) => s.id);
    const board = fillLevelBoard(level.id, {
      characters: { [charSlotId]: null },
    });
    expect(() => validate(board, level.expected, level.endings)).toThrow(
      "should not be called with empty character slots",
    );
  });

  it("throws when the level has no incorrect ending", () => {
    const level = levels[0];
    const [sceneSlotId] = Object.keys(level.expected.scenes);
    const board = fillLevelBoard(level.id, {
      scenes: { [sceneSlotId]: "scene:other" },
    });
    const endingsWithoutIncorrect = level.endings.filter(
      (e) => e.type === "correct",
    );
    expect(() =>
      validate(board, level.expected, endingsWithoutIncorrect),
    ).toThrow("missing an incorrect ending");
  });
});
