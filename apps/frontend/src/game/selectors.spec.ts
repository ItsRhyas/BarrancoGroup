import { describe, expect, it } from "vitest";
import { isLevelComplete } from "./selectors";
import { createInitialBoard, boardReducer } from "./reducer";
import { levels } from "./levels";

function expectedSceneForSlot(level: (typeof levels)[number], slotId: string) {
  const sceneId = level.expected.scenes[slotId];
  return level.scenes.find((s) => s.id === sceneId)!;
}

describe("isLevelComplete", () => {
  for (const level of levels) {
    describe(`level ${level.id}`, () => {
      it("is false on a fresh board", () => {
        expect(isLevelComplete(createInitialBoard(level))).toBe(false);
      });

      it("is false when only the scenes are placed", () => {
        let state = createInitialBoard(level);
        for (const sceneSlot of level.sceneSlots) {
          const scene = expectedSceneForSlot(level, sceneSlot.id);
          state = boardReducer(state, {
            type: "PLACE_SCENE",
            sceneSlotId: sceneSlot.id,
            sceneId: scene.id,
            characterSlotIds: scene.characterSlots.map((s) => s.id),
          });
        }
        expect(isLevelComplete(state)).toBe(false);
      });

      it("is false when one character slot is still empty", () => {
        let state = createInitialBoard(level);
        for (const sceneSlot of level.sceneSlots) {
          const scene = expectedSceneForSlot(level, sceneSlot.id);
          state = boardReducer(state, {
            type: "PLACE_SCENE",
            sceneSlotId: sceneSlot.id,
            sceneId: scene.id,
            characterSlotIds: scene.characterSlots.map((s) => s.id),
          });
        }
        const firstSlot = level.sceneSlots[0];
        const firstScene = expectedSceneForSlot(level, firstSlot.id);
        state = boardReducer(state, {
          type: "PLACE_CHARACTER",
          sceneSlotId: firstSlot.id,
          charSlotId: firstScene.characterSlots[0].id,
          characterId: "char:mairin",
        });
        expect(isLevelComplete(state)).toBe(false);
      });

      it("is true when every slot is filled", () => {
        let state = createInitialBoard(level);
        for (const sceneSlot of level.sceneSlots) {
          const scene = expectedSceneForSlot(level, sceneSlot.id);
          state = boardReducer(state, {
            type: "PLACE_SCENE",
            sceneSlotId: sceneSlot.id,
            sceneId: scene.id,
            characterSlotIds: scene.characterSlots.map((s) => s.id),
          });
          for (const charSlot of scene.characterSlots) {
            state = boardReducer(state, {
              type: "PLACE_CHARACTER",
              sceneSlotId: sceneSlot.id,
              charSlotId: charSlot.id,
              characterId: level.expected.characters[charSlot.id],
            });
          }
        }
        expect(isLevelComplete(state)).toBe(true);
      });
    });
  }
});
