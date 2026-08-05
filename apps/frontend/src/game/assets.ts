import type { AssetRegistry } from "./types";

/**
 * Emoji placeholders for the MVP. To swap to final illustrations,
 * replace the `emoji` value with an `image` entry (`type: "image", src: "..."`)
 * using the same `assetId`. No component code needs to change.
 */
export const assetRegistry: AssetRegistry = {
  "scene:classroom": {
    type: "emoji",
    emoji: "🏫",
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
};
