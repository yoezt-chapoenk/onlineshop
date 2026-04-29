"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

const Schema = z.object({
  contact_name: z.string().min(1),
  business_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  city: z.string().min(1),
  monthly_volume: z.string().min(1),
  notes: z.string().optional().nullable(),
});

export type ResellerState = { error?: string; success?: string } | undefined;

export async function submitResellerAction(
  _prev: ResellerState,
  formData: FormData,
): Promise<ResellerState> {
  const { authUser } = await getCurrentUser();
  if (!authUser) return { error: "Anda harus masuk terlebih dahulu." };

  const parsed = Schema.safeParse({
    contact_name: formData.get("contact_name"),
    business_name: formData.get("business_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    monthly_volume: formData.get("monthly_volume"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const admin = getAdminClient();
  if (!admin) return { error: "Layanan belum dikonfigurasi." };

  const { error: insertErr } = await admin.from("reseller_applications").insert({
    business_name: parsed.data.business_name,
    contact_name: parsed.data.contact_name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    city: parsed.data.city,
    monthly_volume: parsed.data.monthly_volume,
    notes: parsed.data.notes || null,
    status: "new",
  });
  if (insertErr) return { error: insertErr.message };

  // Mark the user's reseller_status pending so the dashboard shows
  // the right state immediately, even before admin review.
  await admin
    .from("users")
    .update({ reseller_status: "pending", updated_at: new Date().toISOString() })
    .eq("id", authUser.id);

  revalidatePath("/account");
  revalidatePath("/account/become-reseller");
  return { success: "Aplikasi berhasil dikirim. Tim kami akan meninjau dalam 1–2 hari kerja." };
}
