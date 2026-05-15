import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Service-role Supabase client. Server-only — never import from a client
 * component or expose to the browser.
 *
 * Returns null when the service-role key is not configured so route handlers
 * can degrade gracefully (e.g. surface a 503 instead of crashing). Env vars
 * are re-checked on every call so a serverless platform that injects them
 * after module init still gets a real client on the next invocation.
 */
export function getAdminClient(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
