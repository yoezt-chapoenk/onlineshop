import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";

/**
 * Returns the current authenticated user's profile (subset) so client
 * components can branch on role/email without re-implementing SSR auth.
 * Returns `{ user: null }` when no session is present.
 */
export async function GET() {
  const { authUser, profile } = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: authUser.id,
      email: authUser.email,
      fullName: profile?.full_name ?? null,
      phone: profile?.phone ?? null,
      role: profile?.role ?? "customer",
      resellerStatus: profile?.reseller_status ?? "none",
    },
  });
}
