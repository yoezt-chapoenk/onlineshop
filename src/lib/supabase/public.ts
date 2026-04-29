import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Public (anon) Supabase client. Returns null when env vars are not set so
 * the storefront can fall back to the seed array in `src/lib/products.ts`
 * during local development. Safe to call from both server and client code.
 *
 * Env vars are re-checked on every call so a serverless platform that
 * injects them after module init still gets a real client next time.
 */
export function getPublicClient(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  cached = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return getPublicClient() !== null;
}
