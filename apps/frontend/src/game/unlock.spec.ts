import { describe, expect, it } from "vitest";
import { isChapterUnlocked } from "./unlock";

describe("isChapterUnlocked", () => {
  it("unlocks chapter 0 even when nothing is completed", () => {
    expect(isChapterUnlocked(0, [], 3)).toBe(true);
  });

  it("unlocks chapter n when chapter n - 1 is completed", () => {
    expect(isChapterUnlocked(1, [0], 3)).toBe(true);
    expect(isChapterUnlocked(2, [0, 1], 3)).toBe(true);
  });

  it("keeps chapter n locked when chapter n - 1 is not completed", () => {
    expect(isChapterUnlocked(1, [], 3)).toBe(false);
    expect(isChapterUnlocked(2, [0], 3)).toBe(false);
  });

  it("returns false for negative indices", () => {
    expect(isChapterUnlocked(-1, [], 3)).toBe(false);
  });

  it("returns false for indices at or beyond total", () => {
    expect(isChapterUnlocked(3, [0, 1, 2], 3)).toBe(false);
    expect(isChapterUnlocked(5, [0, 1], 3)).toBe(false);
  });

  it("ignores duplicate completed entries", () => {
    expect(isChapterUnlocked(1, [0, 0, 0], 3)).toBe(true);
  });

  it("handles an empty level list", () => {
    expect(isChapterUnlocked(0, [], 0)).toBe(true);
    expect(isChapterUnlocked(1, [], 0)).toBe(false);
  });
});
