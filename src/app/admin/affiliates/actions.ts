"use server";

import { adminClientOrError } from "@/lib/admin/api";
import { revalidatePath } from "next/cache";

export async function processWithdrawal(id: string, action: "completed" | "rejected") {
  const ctx = adminClientOrError();
  if (!ctx.ok) return { error: "Unauthorized" };

  // Get withdrawal details
  const { data: withdrawal } = await ctx.supabase
    .from("withdrawals")
    .select("*")
    .eq("id", id)
    .single();

  if (!withdrawal || withdrawal.status !== "pending") {
    return { error: "Invalid withdrawal request" };
  }

  // Update status
  const { error: updateErr } = await ctx.supabase
    .from("withdrawals")
    .update({ 
      status: action,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (updateErr) return { error: updateErr.message };

  // If rejected, refund the balance
  if (action === "rejected") {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("balance")
      .eq("id", withdrawal.affiliate_id)
      .single();
    
    if (user) {
      await ctx.supabase
        .from("users")
        .update({ balance: user.balance + withdrawal.amount })
        .eq("id", withdrawal.affiliate_id);
    }
  }

  revalidatePath("/admin/affiliates");
  return { success: true };
}
