import { describe, expect, it } from "vitest";
import { isLevelComplete } from "./selectors";
import { createInitialBoard, boardReducer } from "./reducer";
import { levels } from "./levels";

describe("isLevelComplete", () => {
  for (const level of levels) {
    describe(`level ${level.id}`, () => {
      it("is false on a fresh board", () => {
        expect(isLevelComplete(createInitialBoard(level))).toBe(false);
      });

      it("is false when only the scene is placed", () => {
        const sceneSlotId = level.sceneSlots[0].id;
        let state = createInitialBoard(level);
        state = boardReducer(state, {
          type: "PLACE_SCENE",
          sceneSlotId,
          sceneId: level.scenes[0].id,
          characterSlotIds: level.scenes[0].characterSlots.map((s) => s.id),
        });
        expect(isLevelComplete(state)).toBe(false);
      });

      it("is false when one character slot is still empty", () => {
        const sceneSlotId = level.sceneSlots[0].id;
        const charSlots = level.scenes[0].characterSlots;
        let state = createInitialBoard(level);
        state = boardReducer(state, {
          type: "PLACE_SCENE",
          sceneSlotId,
          sceneId: level.scenes[0].id,
          characterSlotIds: charSlots.map((s) => s.id),
        });
        state = boardReducer(state, {
          type: "PLACE_CHARACTER",
          sceneSlotId,
          charSlotId: charSlots[0].id,
          characterId: "char:mairin",
        });
        expect(isLevelComplete(state)).toBe(false);
      });

      it("is true when every slot is filled", () => {
        const sceneSlotId = level.sceneSlots[0].id;
        const charSlots = level.scenes[0].characterSlots;
        let state = createInitialBoard(level);
        state = boardReducer(state, {
          type: "PLACE_SCENE",
          sceneSlotId,
          sceneId: level.scenes[0].id,
          characterSlotIds: charSlots.map((s) => s.id),
        });
        for (let i = 0; i < charSlots.length; i++) {
          state = boardReducer(state, {
            type: "PLACE_CHARACTER",
            sceneSlotId,
            charSlotId: charSlots[i].id,
            characterId: `char:${i}`,
          });
        }
        expect(isLevelComplete(state)).toBe(true);
      });
    });
  }
});
