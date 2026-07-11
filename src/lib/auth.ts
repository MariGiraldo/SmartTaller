// JWT auth prototype with real server-side verification via GET /api/auth/verify.
// Tokens are simulated base64 payloads stored in localStorage.

export type Role = "admin" | "carpintero";

export interface AuthUser {
  username: string;
  role: Role;
  name: string;
}

interface TokenPayload extends AuthUser {
  exp: number;
  iat: number;
}

const STORAGE_KEY = "smarttaller_jwt";

// Demo credentials
const USERS: Record<string, { password: string; user: AuthUser }> = {
  admin: {
    password: "admin123",
    user: { username: "admin", role: "admin", name: "María García" },
  },
  carpintero: {
    password: "carpintero123",
    user: { username: "carpintero", role: "carpintero", name: "Don Roberto" },
  },
};

function b64encode(obj: unknown): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}
function b64decode<T>(str: string): T {
  return JSON.parse(decodeURIComponent(escape(atob(str)))) as T;
}

export function login(username: string, password: string): AuthUser | null {
  const entry = USERS[username.toLowerCase().trim()];
  if (!entry || entry.password !== password) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    ...entry.user,
    iat: now,
    exp: now + 60 * 60 * 8, // 8h
  };
  const token = `hdr.${b64encode(payload)}.sig`;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, token);
  }
  return entry.user;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

// Local decode — used as fast path before hitting the server.
export function getCurrentUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = b64decode<TokenPayload>(parts[1]);
    if (payload.exp * 1000 < Date.now()) {
      logout();
      return null;
    }
    return { username: payload.username, role: payload.role, name: payload.name };
  } catch {
    return null;
  }
}

// Server-side verification. Returns the user when the token is still valid
// according to the backend, or null (and clears the local token) otherwise.
export async function verifySession(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch("/api/auth/verify", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      logout();
      return null;
    }
    const data = (await res.json()) as { valid: boolean; user?: AuthUser };
    if (!data.valid || !data.user) {
      logout();
      return null;
    }
    return data.user;
  } catch {
    // Network failure — fall back to local decode so offline reloads still work.
    return getCurrentUser();
  }
}

// Simulated fetch interceptor — attaches Authorization header
export function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
