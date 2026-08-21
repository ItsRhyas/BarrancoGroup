import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import {
  readCompletedChapters,
  writeCompletedChapters,
  __resetCompletedStorage,
} from "./session";

describe("completed chapters storage", () => {
  beforeEach(() => {
    localStorage.clear();
    __resetCompletedStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an empty array by default", () => {
    expect(readCompletedChapters()).toEqual([]);
  });

  it("round-trips completed chapter indices", () => {
    writeCompletedChapters(0);
    expect(readCompletedChapters()).toEqual([0]);

    writeCompletedChapters(1);
    expect(readCompletedChapters()).toEqual([0, 1]);
  });

  it("deduplicates repeated writes", () => {
    writeCompletedChapters(0);
    writeCompletedChapters(0);
    writeCompletedChapters(1);
    writeCompletedChapters(0);

    expect(readCompletedChapters()).toEqual([0, 1]);
  });

  it("sorts completed indices", () => {
    writeCompletedChapters(2);
    writeCompletedChapters(0);
    writeCompletedChapters(1);

    expect(readCompletedChapters()).toEqual([0, 1, 2]);
  });

  it("ignores invalid writes", () => {
    writeCompletedChapters(-1);
    writeCompletedChapters(Number.NaN);
    writeCompletedChapters(Number.POSITIVE_INFINITY);

    expect(readCompletedChapters()).toEqual([]);
  });

  it("treats malformed localStorage values as empty", () => {
    localStorage.setItem("mairin:completedChapters", "not-json");
    expect(readCompletedChapters()).toEqual([]);
  });

  it("filters non-numeric entries from stored arrays", () => {
    localStorage.setItem(
      "mairin:completedChapters",
      JSON.stringify([0, "x", 1]),
    );
    expect(readCompletedChapters()).toEqual([0, 1]);
  });

  it("swallows write exceptions and falls back to memory", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    expect(() => writeCompletedChapters(0)).not.toThrow();
    expect(readCompletedChapters()).toEqual([0]);
  });

  it("swallows read exceptions and returns an empty list", () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("Storage disabled");
    });

    expect(readCompletedChapters()).toEqual([]);
  });
});
