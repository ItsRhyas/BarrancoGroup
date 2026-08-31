import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  ensureSession,
  getProgress,
  login,
  recordAttempt,
  register,
  setAccessToken,
} from "./api";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

type FetchMock = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

function stubFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn<FetchMock>(async () => jsonResponse(body, status));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  setAccessToken(null);
});

describe("getProgress", () => {
  it("fetches completed levels", async () => {
    const fetchMock = stubFetch({ completedLevels: ["level-1"] });

    const result = await getProgress();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/api/progress");
    expect(result.completedLevels).toEqual(["level-1"]);
  });

  it("filters non-string level ids", async () => {
    stubFetch({ completedLevels: ["level-1", 2, null, "level-2"] });

    const result = await getProgress();
    expect(result.completedLevels).toEqual(["level-1", "level-2"]);
  });

  it("defaults completedLevels to an empty array when missing", async () => {
    stubFetch({});

    const result = await getProgress();
    expect(result.completedLevels).toEqual([]);
  });
});

describe("recordAttempt", () => {
  it("posts the attempt body as JSON", async () => {
    const fetchMock = stubFetch({});

    await recordAttempt({
      levelId: "level-1",
      success: true,
      endingId: "ending:correct-1",
    });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({
      levelId: "level-1",
      success: true,
      endingId: "ending:correct-1",
    });
  });
});

describe("ensureSession", () => {
  it("posts an empty body to create a session", async () => {
    const fetchMock = stubFetch({});

    await ensureSession();

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({});
  });
});

describe("ApiError", () => {
  it("throws on non-2xx responses", async () => {
    stubFetch({}, 500);

    await expect(getProgress()).rejects.toThrow("status 500");
  });

  it("exposes status and path", async () => {
    stubFetch({}, 404);

    await expect(getProgress()).rejects.toBeInstanceOf(ApiError);
  });
});

describe("auth endpoints", () => {
  it("logs in with username and password", async () => {
    const fetchMock = stubFetch({ accessToken: "jwt", role: "USUARIO" });

    const result = await login("alice", "secret");

    expect(fetchMock.mock.calls[0]?.[0]).toContain("/auth/login");
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({
      username: "alice",
      password: "secret",
    });
    expect(result).toEqual({ accessToken: "jwt", role: "USUARIO" });
  });

  it("registers with username and password", async () => {
    const fetchMock = stubFetch({ accessToken: "jwt", role: "USUARIO" });

    const result = await register("alice", "secret");

    expect(fetchMock.mock.calls[0]?.[0]).toContain("/auth/register");
    expect(result).toEqual({ accessToken: "jwt", role: "USUARIO" });
  });
});

describe("authorization header", () => {
  it("attaches a Bearer token when one is set", async () => {
    setAccessToken("my-jwt");
    const fetchMock = stubFetch({});

    await getProgress();

    const init = fetchMock.mock.calls[0]?.[1];
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer my-jwt",
    );
  });

  it("omits the Authorization header when no token is set", async () => {
    const fetchMock = stubFetch({});

    await getProgress();

    const init = fetchMock.mock.calls[0]?.[1];
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
  });
});
