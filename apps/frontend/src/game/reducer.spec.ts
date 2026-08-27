import { describe, expect, it } from "vitest";
import { boardReducer, createInitialBoard } from "./reducer";
import { levels } from "./levels";
import type { BoardState, Level } from "./types";

function findLevel(levelId: string): Level {
  const level = levels.find((l) => l.id === levelId);
  if (!level) {
    throw new Error(`level not found: ${levelId}`);
  }
  return level;
}

describe("createInitialBoard", () => {
  it("initializes every scene slot with no scene", () => {
    const level = findLevel("level-1");
    const board = createInitialBoard(level);
    for (const slot of level.sceneSlots) {
      expect(board[slot.id].sceneId).toBeNull();
    }
  });

  it("initializes the expected scene's character slots as empty", () => {
    const level = findLevel("level-1");
    const board = createInitialBoard(level);
    for (const [slotId, sceneId] of Object.entries(level.expected.scenes)) {
      const expectedScene = level.scenes.find((s) => s.id === sceneId)!;
      for (const charSlot of expectedScene.characterSlots) {
        expect(board[slotId].characters[charSlot.id]).toBeNull();
      }
    }
  });
});

describe("boardReducer", () => {
  it("LOAD_LEVEL resets the board to a fresh state", () => {
    const level1 = findLevel("level-1");
    const level2 = findLevel("level-2");
    let state = createInitialBoard(level1);
    state = boardReducer(state, {
      type: "PLACE_SCENE",
      sceneSlotId: level1.sceneSlots[0].id,
      sceneId: level1.expected.scenes[level1.sceneSlots[0].id],
      characterSlotIds: level1.scenes[0].characterSlots.map((s) => s.id),
    });
    state = boardReducer(state, { type: "LOAD_LEVEL", level: level2 });
    for (const slot of level2.sceneSlots) {
      expect(state[slot.id].sceneId).toBeNull();
    }
  });

  it("PLACE_SCENE places the scene and seeds its character slots", () => {
    const level = findLevel("level-1");
    const sceneSlotId = level.sceneSlots[0].id;
    const sceneId = level.scenes[0].id;
    let state = createInitialBoard(level);
    state = boardReducer(state, {
      type: "PLACE_SCENE",
      sceneSlotId,
      sceneId,
      characterSlotIds: level.scenes[0].characterSlots.map((s) => s.id),
    });
    expect(state[sceneSlotId].sceneId).toBe(sceneId);
    for (const charSlot of level.scenes[0].characterSlots) {
      expect(state[sceneSlotId].characters[charSlot.id]).toBeNull();
    }
  });

  it("PLACE_SCENE ignores an unknown scene slot", () => {
    const level = findLevel("level-1");
    const state = createInitialBoard(level);
    const next = boardReducer(state, {
      type: "PLACE_SCENE",
      sceneSlotId: "slot-scene-unknown",
      sceneId: level.scenes[0].id,
      characterSlotIds: [],
    });
    expect(next).toBe(state);
  });

  it("PLACE_CHARACTER fills a character slot", () => {
    const level = findLevel("level-1");
    const sceneSlotId = level.sceneSlots[0].id;
    const charSlotId = level.scenes[0].characterSlots[0].id;
    let state = createInitialBoard(level);
    state = boardReducer(state, {
      type: "PLACE_SCENE",
      sceneSlotId,
      sceneId: level.scenes[0].id,
      characterSlotIds: level.scenes[0].characterSlots.map((s) => s.id),
    });
    state = boardReducer(state, {
      type: "PLACE_CHARACTER",
      sceneSlotId,
      charSlotId,
      characterId: "char:mairin",
    });
    expect(state[sceneSlotId].characters[charSlotId]).toBe("char:mairin");
  });

  it("PLACE_CHARACTER overwrites a filled character slot", () => {
    const level = findLevel("level-1");
    const sceneSlotId = level.sceneSlots[0].id;
    const charSlotId = level.scenes[0].characterSlots[0].id;
    let state = createInitialBoard(level);
    state = boardReducer(state, {
      type: "PLACE_SCENE",
      sceneSlotId,
      sceneId: level.scenes[0].id,
      characterSlotIds: level.scenes[0].characterSlots.map((s) => s.id),
    });
    state = boardReducer(state, {
      type: "PLACE_CHARACTER",
      sceneSlotId,
      charSlotId,
      characterId: "char:first",
    });
    state = boardReducer(state, {
      type: "PLACE_CHARACTER",
      sceneSlotId,
      charSlotId,
      characterId: "char:second",
    });
    expect(state[sceneSlotId].characters[charSlotId]).toBe("char:second");
    expect(state[sceneSlotId].characters[charSlotId]).not.toBe("char:first");
  });

  it("PLACE_CHARACTER ignores an unknown character slot", () => {
    const level = findLevel("level-1");
    const sceneSlotId = level.sceneSlots[0].id;
    let state = createInitialBoard(level);
    state = boardReducer(state, {
      type: "PLACE_CHARACTER",
      sceneSlotId,
      charSlotId: "char-slot-unknown",
      characterId: "char:mairin",
    });
    expect(state[sceneSlotId].characters["char-slot-unknown"]).toBeUndefined();
  });

  it("RESET_LEVEL returns a fresh board", () => {
    const level = findLevel("level-1");
    let state = createInitialBoard(level);
    state = boardReducer(state, {
      type: "PLACE_SCENE",
      sceneSlotId: level.sceneSlots[0].id,
      sceneId: level.scenes[0].id,
      characterSlotIds: level.scenes[0].characterSlots.map((s) => s.id),
    });
    const next = boardReducer(state, { type: "RESET_LEVEL", level });
    expect(next[level.sceneSlots[0].id].sceneId).toBeNull();
  });

  it("does not mutate the previous state", () => {
    const level = findLevel("level-1");
    const sceneSlotId = level.sceneSlots[0].id;
    const state = createInitialBoard(level);
    const snapshot: BoardState = JSON.parse(JSON.stringify(state));
    boardReducer(state, {
      type: "PLACE_SCENE",
      sceneSlotId,
      sceneId: level.scenes[0].id,
      characterSlotIds: level.scenes[0].characterSlots.map((s) => s.id),
    });
    expect(state).toEqual(snapshot);
  });
});
