import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * SSR Supabase client tied to the current request's cookies. Use from
 * Server Components, Server Actions, and route handlers when you need
 * the authenticated user's session (storefront /account, login flows).
 *
 * Returns null if env vars are missing so the storefront can degrade
 * gracefully without auth.
 */
export async function getServerSupabase(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options as CookieOptions);
          }
        } catch {
          // Server Components cannot mutate cookies; safely ignore. Server
          // Actions and route handlers (where auth state actually changes)
          // run with a writable cookie store.
        }
      },
    },
  });
}

/**
 * Returns the currently authenticated user (if any) and their hydrated
 * public.users row (role + reseller_status). Returns nulls if auth is
 * not configured or there is no session.
 */
export async function getCurrentUser(): Promise<{
  authUser: { id: string; email: string | null } | null;
  profile: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    role: "customer" | "reseller" | "wholesale" | "admin";
    reseller_status: "none" | "pending" | "approved" | "rejected";
  } | null;
}> {
  const supabase = await getServerSupabase();
  if (!supabase) return { authUser: null, profile: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authUser: null, profile: null };
  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, phone, role, reseller_status")
    .eq("id", user.id)
    .maybeSingle();
  return {
    authUser: { id: user.id, email: user.email ?? null },
    profile: (profile as {
      id: string;
      email: string;
      full_name: string;
      phone: string | null;
      role: "customer" | "reseller" | "wholesale" | "admin";
      reseller_status: "none" | "pending" | "approved" | "rejected";
    } | null) ?? null,
  };
}
