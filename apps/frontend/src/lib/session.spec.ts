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
  writeCompletedChaptersAll,
  __resetCompletedStorage,
  readIntroSeen,
  writeIntroSeen,
  __resetIntroStorage,
  createSessionToken,
  getOrCreateSessionToken,
  readSessionToken,
  __resetSessionTokenStorage,
} from "./session";

describe("completed chapters storage", () => {
  beforeEach(() => {
    localStorage.clear();
    __resetCompletedStorage();
    __resetIntroStorage();
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

describe("intro seen storage", () => {
  beforeEach(() => {
    localStorage.clear();
    __resetIntroStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false by default", () => {
    expect(readIntroSeen()).toBe(false);
  });

  it("round-trips the intro seen flag", () => {
    writeIntroSeen();
    expect(readIntroSeen()).toBe(true);
  });

  it("treats malformed localStorage values as not seen", () => {
    localStorage.setItem("mairin:introSeen", "not-boolean");
    expect(readIntroSeen()).toBe(false);
  });

  it("falls back to memory when localStorage writes fail", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    expect(() => writeIntroSeen()).not.toThrow();
    expect(readIntroSeen()).toBe(true);
  });

  it("falls back to false when localStorage reads fail", () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("Storage disabled");
    });

    expect(readIntroSeen()).toBe(false);
  });

  it("resets the in-memory fallback", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
    writeIntroSeen();
    expect(readIntroSeen()).toBe(true);

    __resetIntroStorage();
    expect(readIntroSeen()).toBe(false);
  });
});

describe("session token storage", () => {
  beforeEach(() => {
    localStorage.clear();
    __resetSessionTokenStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a stable UUID and persists it", () => {
    const token = getOrCreateSessionToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(readSessionToken()).toBe(token);
    expect(getOrCreateSessionToken()).toBe(token);
  });

  it("returns the persisted token across calls", () => {
    const token = getOrCreateSessionToken();
    expect(getOrCreateSessionToken()).toBe(token);
    expect(localStorage.getItem("mairin:sessionToken")).toBe(token);
  });

  it("ignores a malformed stored token and regenerates", () => {
    localStorage.setItem("mairin:sessionToken", "not-a-uuid");
    const token = getOrCreateSessionToken();
    expect(token).toMatch(/^[0-9a-f]{8}-/);
    expect(localStorage.getItem("mairin:sessionToken")).toBe(token);
  });

  it("falls back to memory when localStorage writes fail", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    const token = getOrCreateSessionToken();
    expect(readSessionToken()).toBe(token);
  });

  it("createSessionToken returns a valid v4 UUID", () => {
    const token = createSessionToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});

describe("writeCompletedChaptersAll", () => {
  beforeEach(() => {
    localStorage.clear();
    __resetCompletedStorage();
  });

  it("overwrites the stored list with the given indices", () => {
    writeCompletedChapters(1);
    writeCompletedChaptersAll([0, 2]);

    expect(readCompletedChapters()).toEqual([0, 2]);
  });

  it("normalizes and dedupes the provided indices", () => {
    writeCompletedChaptersAll([2, 0, 2, -1, Number.NaN, 1]);

    expect(readCompletedChapters()).toEqual([0, 1, 2]);
  });
});
