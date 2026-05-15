"use server";

import { adminClientOrError } from "@/lib/admin/api";
import { revalidatePath } from "next/cache";

export async function processPaymentConfirmation(id: string, orderNumber: string, action: "approved" | "rejected") {
  const ctx = adminClientOrError();
  if (!ctx.ok) return { error: "Unauthorized" };

  // 1. Update confirmation status
  const { error: confError } = await ctx.supabase
    .from("payment_confirmations")
    .update({ status: action })
    .eq("id", id);

  if (confError) return { error: confError.message };

  // 2. If approved, update order status to paid
  if (action === "approved") {
    const { error: orderError } = await ctx.supabase
      .from("orders")
      .update({ 
        status: "paid",
        updated_at: new Date().toISOString()
      })
      .eq("order_number", orderNumber);
      
    if (orderError) return { error: orderError.message };
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
  return { success: true };
}
