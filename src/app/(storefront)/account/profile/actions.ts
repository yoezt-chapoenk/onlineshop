"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser, getServerSupabase } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { t } from "@/lib/i18n";

const ProfileSchema = z.object({
  full_name: z.string().min(1),
  phone: z
    .string()
    .min(0)
    .max(40)
    .transform((v) => v.trim() || null)
    .nullable(),
});

export type ProfileState = { error?: string; success?: string } | undefined;

export async function saveProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { authUser } = await getCurrentUser();
  if (!authUser) return { error: t.auth.invalidCredentials };

  const parsed = ProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const admin = getAdminClient();
  if (!admin) return { error: "Layanan belum dikonfigurasi." };

  const { error } = await admin
    .from("users")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", authUser.id);
  if (error) return { error: error.message };

  revalidatePath("/account");
  return { success: t.account.profileSaved };
}

const PasswordSchema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirm"],
  });

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { authUser } = await getCurrentUser();
  if (!authUser) return { error: "Anda belum login." };

  const parsed = PasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await getServerSupabase();
  if (!supabase) return { error: "Layanan belum dikonfigurasi." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  return { success: "Password berhasil diubah." };
}
