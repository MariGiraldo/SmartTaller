// Prototipo de autenticación JWT con verificación real en el servidor mediante GET /api/auth/verify.
// Los tokens son cargas útiles (payloads) simuladas en base64 almacenadas en localStorage.

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

// Decodificación local: utilizada como vía rápida antes de llegar al servidor.
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

// Verificación del lado del servidor. Devuelve el usuario si el token sigue siendo válido
// según el backend, o null (y borra el token local) en caso contrario.
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
    // Fallo de red: se recurre a la decodificación local para que las recargas sin conexión sigan funcionando.
    return getCurrentUser();
  }
}

// Interceptor de fetch simulado: añade la cabecera Authorization
export function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
