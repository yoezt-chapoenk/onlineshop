import "server-only";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Helper used by every /api/admin/* route handler.
 * Returns the configured service-role client, or a 503 response when the
 * Supabase env vars are missing so deployments without a database don't
 * 500-storm the admin UI.
 *
 * Authentication is already enforced by `src/proxy.ts` (HTTP Basic Auth
 * keyed on ADMIN_BASIC_AUTH_USER/PASSWORD); this helper only deals with
 * the Supabase availability check.
 */
export function adminClientOrError():
  | { ok: true; supabase: SupabaseClient }
  | { ok: false; response: NextResponse } {
  const supabase = getAdminClient();
  if (!supabase) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
            "SUPABASE_SERVICE_ROLE_KEY in your environment.",
        },
        { status: 503 },
      ),
    };
  }
  return { ok: true, supabase };
}
