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

  // Need the prior status so we know whether this transition crosses the
  // "stock has been decremented" boundary (any status after pending).
  const { data: prior } = await ctx.supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  const priorStatus = (prior as { status?: string } | null)?.status ?? null;

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
    .select("*, items:order_items(*)")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const order = data;

  // If transitioning into cancelled/refunded from a state where stock was
  // already decremented, restock the items and reverse any affiliate
  // commission that was already paid out. The SQL function is idempotent
  // so re-running with the same order_id is safe.
  const becomingVoid =
    (parsed.data.status === "cancelled" || parsed.data.status === "refunded") &&
    priorStatus !== "cancelled" &&
    priorStatus !== "refunded" &&
    priorStatus !== null;
  if (becomingVoid) {
    await ctx.supabase.rpc("restock_order_items", { p_order_id: id });

    // Reverse commission if one was already issued for this order
    const { data: comm } = await ctx.supabase
      .from("commissions")
      .select("id, affiliate_id, amount, status")
      .eq("order_id", id)
      .maybeSingle();
    if (comm && comm.status !== "refunded") {
      const { data: affiliate } = await ctx.supabase
        .from("users")
        .select("balance")
        .eq("id", comm.affiliate_id)
        .maybeSingle();
      const newBalance = Math.max(0, (affiliate?.balance ?? 0) - comm.amount);
      await ctx.supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("id", comm.affiliate_id);
      await ctx.supabase
        .from("commissions")
        .update({ status: "refunded" })
        .eq("id", comm.id);
    }
  }

  // Process affiliate commission if status is 'fulfilled'
  if (parsed.data.status === "fulfilled" && order?.affiliate_code) {
    // Check if commission already given for this order to prevent duplicate
    const { data: existingComm } = await ctx.supabase
      .from("commissions")
      .select("id")
      .eq("order_id", id)
      .maybeSingle();

    if (!existingComm) {
      // Find affiliate user
      const { data: affiliate } = await ctx.supabase
        .from("users")
        .select("id, balance")
        .eq("affiliate_code", order.affiliate_code)
        .maybeSingle();

      if (affiliate) {
        // Fetch commission rate from settings
        const { data: settings } = await ctx.supabase
          .from("site_settings")
          .select("affiliate_commission_percent")
          .eq("id", 1)
          .single();
        
        const percent = settings?.affiliate_commission_percent || 5.0;
        // Total base for commission is subtotal (excluding shipping)
        const commissionAmount = Math.floor(order.subtotal * (percent / 100));

        // Insert commission record
        await ctx.supabase.from("commissions").insert({
          order_id: id,
          affiliate_id: affiliate.id,
          amount: commissionAmount,
          status: "paid"
        });

        // Update order with commission amount
        await ctx.supabase.from("orders").update({ commission_amount: commissionAmount }).eq("id", id);

        // Increment user balance
        await ctx.supabase.from("users").update({ balance: affiliate.balance + commissionAmount }).eq("id", affiliate.id);
      }
    }
  }

  return NextResponse.json({ order });
}
