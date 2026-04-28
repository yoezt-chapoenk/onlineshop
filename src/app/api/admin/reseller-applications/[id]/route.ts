import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  status: z.enum(["new", "approved", "rejected"]),
  admin_note: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { data: app, error } = await ctx.supabase
    .from("reseller_applications")
    .update({
      status: parsed.data.status,
      admin_note: parsed.data.admin_note ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // On approval, ensure the user has a row with reseller role + status.
  if (parsed.data.status === "approved" && app) {
    const a = app as { email: string; contact_name: string; phone: string };
    const { error: upsertErr } = await ctx.supabase
      .from("users")
      .upsert(
        {
          email: a.email,
          full_name: a.contact_name,
          phone: a.phone,
          role: "reseller",
          reseller_status: "approved",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );
    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }
  }
  if (parsed.data.status === "rejected" && app) {
    const a = app as { email: string };
    await ctx.supabase
      .from("users")
      .update({ reseller_status: "rejected", updated_at: new Date().toISOString() })
      .eq("email", a.email);
  }

  return NextResponse.json({ application: app });
}
