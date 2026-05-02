"use server";

import { getServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateAffiliateCode(code: string) {
  const supabase = await getServerSupabase();
  if (!supabase) return { error: "Database not configured" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "Not logged in" };

  // Check if code is taken
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("affiliate_code", code)
    .maybeSingle();

  if (existing) {
    return { error: "Kode sudah digunakan oleh agen lain. Silakan pilih kode lain." };
  }

  const { error } = await supabase
    .from("users")
    .update({ affiliate_code: code })
    .eq("id", session.user.id);

  if (error) return { error: error.message };

  revalidatePath("/account/affiliate");
  return { success: true };
}

export async function requestWithdrawal(amount: number, bankName: string, accountName: string, accountNumber: string) {
  const supabase = await getServerSupabase();
  if (!supabase) return { error: "Database not configured" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "Not logged in" };

  // Re-check balance securely
  const { data: profile } = await supabase
    .from("users")
    .select("balance")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.balance < amount) {
    return { error: "Saldo tidak mencukupi" };
  }

  // Insert withdrawal
  const { error: insertError } = await supabase
    .from("withdrawals")
    .insert({
      affiliate_id: session.user.id,
      amount,
      bank_name: bankName,
      account_name: accountName,
      account_number: accountNumber,
    });

  if (insertError) return { error: insertError.message };

  // Deduct balance
  const { error: updateError } = await supabase
    .from("users")
    .update({ balance: profile.balance - amount })
    .eq("id", session.user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/account/affiliate");
  return { success: true };
}
