export interface RecordAttemptInput {
  sessionToken: string;
  levelId: string;
  success: boolean;
  endingId?: string;
}

export interface ProgressResponse {
  sessionToken: string;
  completedLevels: string[];
}

export interface AuthResponse {
  accessToken: string;
  role: string;
}

const API_BASE: string = import.meta.env.VITE_API_URL ?? "/api";

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string) {
    super(`Request to ${path} failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers ?? {}) as Record<string, string>),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!response.ok) {
    throw new ApiError(response.status, path);
  }

  return (await response.json()) as T;
}

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function register(
  username: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function ensureSession(sessionToken: string): Promise<unknown> {
  return request("/sessions", {
    method: "POST",
    body: JSON.stringify({ sessionToken }),
  });
}

export function recordAttempt(input: RecordAttemptInput): Promise<unknown> {
  return request("/attempts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getProgress(
  sessionToken: string,
): Promise<ProgressResponse> {
  const query = new URLSearchParams({ sessionToken });
  const data = await request<{
    sessionToken?: unknown;
    completedLevels?: unknown;
  }>(`/progress?${query.toString()}`);

  return {
    sessionToken:
      typeof data.sessionToken === "string" ? data.sessionToken : sessionToken,
    completedLevels: Array.isArray(data.completedLevels)
      ? data.completedLevels.filter(
          (level): level is string => typeof level === "string",
        )
      : [],
  };
}
