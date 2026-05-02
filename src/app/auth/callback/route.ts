import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

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
  // Accept bare `/`, `/?…`, and `/<path>` while still blocking `//`
  // and `/\` prefixes.
  const next = /^\/(?:$|\?|[^/\\])/.test(raw) ? raw : "/account";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      // Auto-create user profile for OAuth signups (like Google)
      if (!error && data.user) {
        const admin = getAdminClient();
        if (admin) {
          const user = data.user;
          // Check if profile exists
          const { data: existing } = await admin
            .from("users")
            .select("id")
            .eq("email", user.email)
            .maybeSingle();
            
          if (existing && existing.id !== user.id) {
            // Found by email but different ID (pre-auth reseller approval)
            await admin.from("users").update({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
              updated_at: new Date().toISOString()
            }).eq("email", user.email);
          } else if (!existing) {
            // Completely new user
            await admin.from("users").insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
              role: "customer",
              reseller_status: "none"
            });
          }
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
