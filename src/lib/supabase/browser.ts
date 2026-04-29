"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/**
 * Browser-side Supabase client used by Client Components. Reads the
 * session from the cookies set by the SSR server client. Returns null
 * if env vars are missing.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    cached = null;
    return cached;
  }
  cached = createBrowserClient(url, anonKey);
  return cached;
}
