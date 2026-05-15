import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  businessName: z.string().min(1).max(160),
  contactName: z.string().min(1).max(160),
  email: z.string().email(),
  phone: z.string().min(6).max(40),
  city: z.string().min(1).max(120),
  monthlyVolume: z.string().min(1).max(80),
  notes: z.string().max(2000).optional().nullable(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = getAdminClient();
  if (!supabase) {
    // Dev fallback: not persisted. Pretend success so the form UX still works.
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("reseller_applications").insert({
    business_name: parsed.data.businessName,
    contact_name: parsed.data.contactName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    city: parsed.data.city,
    monthly_volume: parsed.data.monthlyVolume,
    notes: parsed.data.notes ?? null,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, persisted: true });
}
