import type { AssetRegistry } from "./types";

/**
 * Asset registry for the game.
 *
 * Each entry maps an `assetId` (used by `levels.ts`) to either an emoji
 * placeholder or an image asset. The `aspectRatio` field helps the board lay
 * out scenes and characters without stretching.
 *
 * To add a new visual asset for a level, append one entry here and reference
 * its `assetId` in `levels.ts`. No component code needs to change.
 */
export const assetRegistry: AssetRegistry = {
  "scene:classroom": {
    type: "emoji",
    emoji: "🏫",
    aspectRatio: 16 / 9,
  },
  "scene:park": {
    type: "emoji",
    emoji: "🌳",
    aspectRatio: 16 / 9,
  },
  "char:mairin": {
    type: "emoji",
    emoji: "👧",
    aspectRatio: 1,
  },
  "char:teacher": {
    type: "emoji",
    emoji: "👨‍🏫",
    aspectRatio: 1,
  },
  "char:peer": {
    type: "emoji",
    emoji: "👦",
    aspectRatio: 1,
  },
  "char:friend-wheelchair": {
    type: "emoji",
    emoji: "🧑‍🦽",
    aspectRatio: 1,
  },
  "char:friend-bench": {
    type: "emoji",
    emoji: "🧒",
    aspectRatio: 1,
  },
};
