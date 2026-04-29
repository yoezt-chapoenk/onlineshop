import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * OAuth / email-link callback. Supabase redirects here with a `code`
 * query param (PKCE) which we exchange for a session cookie.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
