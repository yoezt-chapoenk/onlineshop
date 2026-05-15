import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public endpoint — returns payment configuration (bank accounts + QRIS URL).
 * No auth required since this data is shown on the checkout page.
 */
export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ banks: [], qrisUrl: null });
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("payment_banks, payment_qris_url")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[payment-config] Supabase error:", error.message);
    return NextResponse.json({ banks: [], qrisUrl: null });
  }

  const row = data as Record<string, unknown> | null;
  const banks = Array.isArray(row?.payment_banks) ? row.payment_banks : [];
  const qrisUrl = typeof row?.payment_qris_url === "string" && row.payment_qris_url
    ? row.payment_qris_url
    : null;

  return NextResponse.json({ banks, qrisUrl });
}
