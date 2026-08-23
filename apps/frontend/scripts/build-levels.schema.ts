import { z } from "zod";

export const characterSlotDefSchema = z.object({
  id: z.string().min(1),
  anchorX: z.number().int().min(0).max(100),
  anchorY: z.number().int().min(0).max(100),
});

export const sceneDefSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  label: z.string().min(1),
  characterSlots: z.array(characterSlotDefSchema),
  iconAssetId: z.string().min(1).optional(),
  sceneAssetId: z.string().min(1).optional(),
});

export const sceneSlotDefSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const characterDefSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  label: z.string().min(1),
  iconAssetId: z.string().min(1).optional(),
  sceneAssetId: z.string().min(1).optional(),
});

export const endingSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["correct", "incorrect"]),
  title: z.string().min(1),
  description: z.string().min(1),
  imageAssetId: z.string().min(1).optional(),
});

export const expectedSolutionSchema = z.object({
  scenes: z.record(z.string().min(1), z.string().min(1)),
  characters: z.record(z.string().min(1), z.string().min(1)),
  correctEndingId: z.string().min(1),
});

export const chapterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sceneSlots: z.array(sceneSlotDefSchema),
  scenes: z.array(sceneDefSchema),
  characters: z.array(characterDefSchema),
  expected: expectedSolutionSchema,
  endings: z.array(endingSchema).refine(
    (endings) => {
      const correctCount = endings.filter((e) => e.type === "correct").length;
      const incorrectCount = endings.filter((e) => e.type === "incorrect").length;
      return correctCount === 1 && incorrectCount >= 1;
    },
    {
      message:
        "endings must contain exactly one correct ending and at least one incorrect ending",
    },
  ),
  order: z.number().int().optional(),
});
