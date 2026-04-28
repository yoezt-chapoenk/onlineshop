import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";
import { ORDER_STATUSES } from "@/lib/admin/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  status: z.enum(ORDER_STATUSES),
  tracking_courier: z.string().optional().nullable(),
  tracking_number: z.string().optional().nullable(),
  admin_note: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id } = await params;
  const { data, error } = await ctx.supabase
    .from("orders")
    .update({
      status: parsed.data.status,
      tracking_courier: parsed.data.tracking_courier || null,
      tracking_number: parsed.data.tracking_number || null,
      admin_note: parsed.data.admin_note || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
