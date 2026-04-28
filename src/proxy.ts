import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (formerly Middleware in Next.js <=15) — protects /admin and
 * /api/admin routes with HTTP Basic Auth.
 *
 * Credentials come from env vars:
 *   ADMIN_BASIC_AUTH_USER
 *   ADMIN_BASIC_AUTH_PASSWORD
 *
 * If neither is set, /admin is intentionally inaccessible (returns 503)
 * so an unconfigured deploy can't expose the dashboard.
 */
export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_BASIC_AUTH_USER;
  const pass = process.env.ADMIN_BASIC_AUTH_PASSWORD;

  if (!user || !pass) {
    return new NextResponse(
      "Admin dashboard is not configured. Set ADMIN_BASIC_AUTH_USER and " +
        "ADMIN_BASIC_AUTH_PASSWORD environment variables.",
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const idx = decoded.indexOf(":");
    if (idx >= 0) {
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (u === user && p === pass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Juragan Grosir Admin", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
