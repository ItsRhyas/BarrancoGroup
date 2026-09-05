import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAccessToken, setAccessToken } from "./api";
import {
  __resetAuthStorage,
  ensureAccessToken,
  getOrCreateCredentials,
  isTokenExpired,
  readAccessToken,
} from "./auth";

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function makeToken(expSeconds: number): string {
  return `header.${encodeBase64Url(JSON.stringify({ exp: expSeconds }))}.sig`;
}

function futureToken(): string {
  return makeToken(Math.floor(Date.now() / 1000) + 3600);
}

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

type FetchMock = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

beforeEach(() => {
  localStorage.clear();
  __resetAuthStorage();
  setAccessToken(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getOrCreateCredentials", () => {
  it("generates a valid username and password", () => {
    const creds = getOrCreateCredentials();
    expect(creds.username).toMatch(/^mairin-[0-9a-f]{12}$/i);
    expect(creds.password).toMatch(/^[0-9a-f]{32}$/i);
  });

  it("returns the same credentials across calls", () => {
    const first = getOrCreateCredentials();
    expect(getOrCreateCredentials()).toEqual(first);
  });
});

describe("isTokenExpired", () => {
  it("returns false for a future exp", () => {
    expect(isTokenExpired(futureToken())).toBe(false);
  });

  it("returns true for a past exp", () => {
    expect(isTokenExpired(makeToken(Math.floor(Date.now() / 1000) - 1))).toBe(
      true,
    );
  });

  it("returns false for a malformed token", () => {
    expect(isTokenExpired("not-a-jwt")).toBe(false);
  });
});

describe("ensureAccessToken", () => {
  it("reuses a stored valid token without any network call", async () => {
    localStorage.setItem("mairin:authToken", futureToken());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const token = await ensureAccessToken();

    expect(token).toBe(futureToken());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs in with stored credentials and persists the token", async () => {
    localStorage.setItem("mairin:authUsername", "alice");
    localStorage.setItem("mairin:authPassword", "secret");
    const fetchMock = vi.fn<FetchMock>(async () =>
      jsonResponse({ accessToken: "jwt", role: "USUARIO" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const token = await ensureAccessToken();

    expect(fetchMock.mock.calls[0]?.[0]).toContain("/auth/login");
    expect(token).toBe("jwt");
    expect(readAccessToken()).toBe("jwt");
    expect(getAccessToken()).toBe("jwt");
  });

  it("registers a new account when login fails", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes("/auth/login")
        ? jsonResponse({}, 401)
        : jsonResponse({ accessToken: "jwt", role: "USUARIO" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const token = await ensureAccessToken();

    expect(token).toBe("jwt");
    const urls = fetchMock.mock.calls.map((call) => call[0]);
    expect(urls[0]).toContain("/auth/login");
    expect(urls[1]).toContain("/auth/register");
    expect(readAccessToken()).toBe("jwt");
  });

  it("regenerates credentials when register hits a username conflict", async () => {
    let call = 0;
    const fetchMock = vi.fn(async () => {
      call += 1;
      if (call === 1) return jsonResponse({}, 401); // login fails
      if (call === 2) return jsonResponse({}, 409); // register conflict
      return jsonResponse({ accessToken: "jwt", role: "USUARIO" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const token = await ensureAccessToken();

    expect(token).toBe("jwt");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(readAccessToken()).toBe("jwt");
  });

  it("re-authenticates when the stored token is expired", async () => {
    const expired = makeToken(Math.floor(Date.now() / 1000) - 1);
    localStorage.setItem("mairin:authToken", expired);
    localStorage.setItem("mairin:authUsername", "alice");
    localStorage.setItem("mairin:authPassword", "secret");
    const fetchMock = vi.fn(async () =>
      jsonResponse({ accessToken: "fresh", role: "USUARIO" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const token = await ensureAccessToken();

    expect(token).toBe("fresh");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
