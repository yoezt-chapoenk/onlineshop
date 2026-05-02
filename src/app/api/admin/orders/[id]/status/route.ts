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
    .select("*, items:order_items(*)")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  const order = data;

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
