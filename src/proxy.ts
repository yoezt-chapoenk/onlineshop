import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const ref = url.searchParams.get('ref');

  // 1. Affiliate ref tracking (runs on all non-static paths)
  if (ref) {
    const response = NextResponse.redirect(new URL(url.pathname, request.url));
    response.cookies.set('jg_ref', ref, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    });
    return response;
  }

  // 2. Admin Authentication (only on /admin and /api/admin)
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
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
      let decoded: string | null = null;
      try {
        decoded = atob(header.slice(6));
      } catch {
        decoded = null;
      }
      if (decoded !== null) {
        const idx = decoded.indexOf(":");
        if (idx >= 0) {
          const u = decoded.slice(0, idx);
          const p = decoded.slice(idx + 1);
          if (u === user && p === pass) {
            return NextResponse.next();
          }
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all paths except static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
