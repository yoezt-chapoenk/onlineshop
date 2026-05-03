import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";
import { ORDER_STATUSES } from "@/lib/admin/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BulkSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1),
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
});

export async function PATCH(request: Request) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;

  const body = await request.json().catch(() => null);
  const parsed = BulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { orderIds, status } = parsed.data;

  const { error } = await ctx.supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", orderIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: orderIds.length });
}
