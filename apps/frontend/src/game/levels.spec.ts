import { describe, expect, it } from "vitest";
import { levels } from "./levels";
import { assetRegistry } from "./assets";

describe("level data integrity", () => {
  it("defines five fully playable levels", () => {
    expect(levels.length).toBe(5);
  });

  it("has scene slot counts of 1, 2, 2, 3, 3 across levels", () => {
    expect(levels.map((level) => level.sceneSlots.length)).toEqual([
      1, 2, 2, 3, 3,
    ]);
  });

  for (const level of levels) {
    describe(`level ${level.id}`, () => {
      it("has a title, narrative, and context", () => {
        expect(level.title.length).toBeGreaterThan(0);
        expect(level.narrative.length).toBeGreaterThan(0);
        expect(level.context.length).toBeGreaterThan(0);
      });

      it("references only registered assets", () => {
        for (const scene of level.scenes) {
          expect(assetRegistry[scene.assetId]).toBeDefined();
        }
        for (const character of level.characters) {
          expect(assetRegistry[character.assetId]).toBeDefined();
        }
      });

      it("has exactly one correct ending and at least one incorrect ending", () => {
        const correct = level.endings.filter((e) => e.type === "correct");
        const incorrect = level.endings.filter((e) => e.type === "incorrect");
        expect(correct).toHaveLength(1);
        expect(incorrect.length).toBeGreaterThanOrEqual(1);
      });

      it("references registered assets for every ending with an imageAssetId", () => {
        for (const ending of level.endings) {
          if (ending.imageAssetId) {
            expect(assetRegistry[ending.imageAssetId]).toBeDefined();
          }
        }
      });

      it("resolves the correct ending asset", () => {
        const correctEnding = level.endings.find((e) => e.type === "correct");
        expect(correctEnding).toBeDefined();
        expect(correctEnding!.imageAssetId).toBeDefined();
        expect(assetRegistry[correctEnding!.imageAssetId!]).toBeDefined();
      });

      it("expected scenes reference existing scene slots and scenes", () => {
        for (const [slotId, sceneId] of Object.entries(level.expected.scenes)) {
          expect(level.sceneSlots.some((s) => s.id === slotId)).toBe(true);
          expect(level.scenes.some((s) => s.id === sceneId)).toBe(true);
        }
      });

      it("expected characters reference existing characters and character slots", () => {
        for (const [charSlotId, characterId] of Object.entries(
          level.expected.characters,
        )) {
          expect(level.characters.some((c) => c.id === characterId)).toBe(true);
          expect(
            level.scenes.some((scene) =>
              scene.characterSlots.some((slot) => slot.id === charSlotId),
            ),
          ).toBe(true);
        }
      });

      it("character slot ids are unique across the level", () => {
        const allSlotIds = level.scenes.flatMap((scene) =>
          scene.characterSlots.map((slot) => slot.id),
        );
        expect(new Set(allSlotIds).size).toBe(allSlotIds.length);
      });

      it("scene slots have anchors within 0-100%", () => {
        for (const scene of level.scenes) {
          for (const slot of scene.characterSlots) {
            expect(slot.anchorX).toBeGreaterThanOrEqual(0);
            expect(slot.anchorX).toBeLessThanOrEqual(100);
            expect(slot.anchorY).toBeGreaterThanOrEqual(0);
            expect(slot.anchorY).toBeLessThanOrEqual(100);
          }
        }
      });
    });
  }
});
