"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  phone: z.string().min(6).optional().or(z.literal("")),
});

const ForgotSchema = z.object({
  email: z.string().email(),
});

export type AuthState = { error?: string; success?: string } | undefined;

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Format email atau password salah." };
  const supabase = await getServerSupabase();
  if (!supabase) return { error: "Layanan autentikasi belum dikonfigurasi." };
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email atau password salah." };
  revalidatePath("/", "layout");
  redirect("/account");
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Data tidak valid.";
    return { error: msg };
  }
  const confirm = formData.get("confirm_password");
  if (typeof confirm === "string" && confirm !== parsed.data.password) {
    return { error: "Konfirmasi password tidak cocok." };
  }
  const supabase = await getServerSupabase();
  if (!supabase) return { error: "Layanan autentikasi belum dikonfigurasi." };
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone || null,
      },
    },
  });
  if (error) return { error: error.message };

  // Best-effort: insert/upsert the public.users row so the app can read
  // role/full_name without relying on the auth-trigger to have run yet.
  const admin = getAdminClient();
  if (admin && data.user) {
    await admin
      .from("users")
      .upsert(
        {
          id: data.user.id,
          email: parsed.data.email,
          full_name: parsed.data.full_name,
          phone: parsed.data.phone || null,
          role: "customer",
          reseller_status: "none",
        },
        { onConflict: "id" },
      );
  }

  // If Supabase project requires email confirmation the session is
  // null; show a confirmation notice. Otherwise sign-in is automatic.
  if (!data.session) {
    return {
      success:
        "Akun berhasil dibuat. Silakan cek email Anda untuk aktivasi sebelum masuk.",
    };
  }
  revalidatePath("/", "layout");
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  const supabase = await getServerSupabase();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = ForgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Format email tidak valid." };
  const supabase = await getServerSupabase();
  if (!supabase) return { error: "Layanan autentikasi belum dikonfigurasi." };
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback`,
  });
  if (error) return { error: error.message };
  return { success: "Tautan reset password sudah dikirim. Silakan cek email Anda." };
}
