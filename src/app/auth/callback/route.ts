import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * OAuth / email-link callback. Supabase redirects here with a `code`
 * query param (PKCE) which we exchange for a session cookie.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const raw = searchParams.get("next") ?? "/account";
  // Only allow same-origin absolute paths. Reject protocol-relative
  // (`//evil.com`) and backslash-prefixed (`/\evil.com`) values that
  // some URL parsers interpret as cross-origin redirects (CWE-601).
  const next = /^\/[^/\\]/.test(raw) ? raw : "/account";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
