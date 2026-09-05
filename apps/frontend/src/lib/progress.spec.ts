import { afterEach, describe, expect, it, vi } from "vitest";
import * as api from "./api";
import {
  backfillMissing,
  hydrateProgress,
  levelIdForIndex,
  serverLevelsToIndices,
} from "./progress";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("serverLevelsToIndices", () => {
  it("maps known level ids to their indices", () => {
    expect(serverLevelsToIndices(["level-1", "level-3"])).toEqual([0, 2]);
  });

  it("drops unknown level ids", () => {
    expect(serverLevelsToIndices(["level-1", "level-99"])).toEqual([0]);
  });
});

describe("levelIdForIndex", () => {
  it("returns the level id for a valid index", () => {
    expect(levelIdForIndex(0)).toBe("level-1");
    expect(levelIdForIndex(4)).toBe("level-5");
  });

  it("returns null for out-of-range indices", () => {
    expect(levelIdForIndex(-1)).toBeNull();
    expect(levelIdForIndex(99)).toBeNull();
  });
});

describe("hydrateProgress", () => {
  it("fetches progress and maps to indices", async () => {
    vi.spyOn(api, "getProgress").mockResolvedValue({
      completedLevels: ["level-1", "level-2"],
    });

    await expect(hydrateProgress()).resolves.toEqual([0, 1]);
  });
});

describe("backfillMissing", () => {
  it("records success attempts for locally-completed levels missing server-side", async () => {
    const recordAttempt = vi
      .spyOn(api, "recordAttempt")
      .mockResolvedValue({});

    await backfillMissing([0, 1], [1]);

    expect(recordAttempt).toHaveBeenCalledTimes(1);
    expect(recordAttempt).toHaveBeenCalledWith({
      levelId: "level-1",
      success: true,
    });
  });

  it("does nothing when nothing is missing", async () => {
    const recordAttempt = vi
      .spyOn(api, "recordAttempt")
      .mockResolvedValue({});

    await backfillMissing([0], [0]);

    expect(recordAttempt).not.toHaveBeenCalled();
  });

  it("swallows network errors", async () => {
    vi.spyOn(api, "recordAttempt").mockRejectedValue(new Error("offline"));

    await expect(backfillMissing([0], [])).resolves.toBeUndefined();
  });
});
