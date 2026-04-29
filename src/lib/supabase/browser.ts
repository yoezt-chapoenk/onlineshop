"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Browser-side Supabase client used by Client Components. Reads the
 * session from the cookies set by the SSR server client. Returns null
 * if env vars are missing. Env vars are re-checked on every call so a
 * page rendered before NEXT_PUBLIC_* injection still gets a real
 * client on subsequent invocations.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  cached = createBrowserClient(url, anonKey);
  return cached;
}
