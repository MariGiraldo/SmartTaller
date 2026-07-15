import { createFileRoute } from "@tanstack/react-router";

interface TokenPayload {
  username: string;
  role: "admin" | "carpintero";
  name: string;
  exp: number;
  iat: number;
}

function decodePayload(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // atob is available in the Worker runtime
    const json = atob(parts[1]);
    return JSON.parse(decodeURIComponent(escape(json))) as TokenPayload;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/auth/verify")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const match = auth.match(/^Bearer\s+(.+)$/i);
        if (!match) {
          return Response.json(
            { valid: false, reason: "missing_token" },
            { status: 401 },
          );
        }
        const payload = decodePayload(match[1]);
        if (!payload) {
          return Response.json(
            { valid: false, reason: "malformed_token" },
            { status: 401 },
          );
        }
        if (payload.exp * 1000 < Date.now()) {
          return Response.json(
            { valid: false, reason: "expired" },
            { status: 401 },
          );
        }
        return Response.json({
          valid: true,
          user: {
            username: payload.username,
            role: payload.role,
            name: payload.name,
          },
          exp: payload.exp,
        });
      },
    },
  },
});
