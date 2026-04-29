import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  store_name: z.string().min(1),
  store_logo_url: z.string().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  whatsapp_number: z.string().nullable().optional(),
  store_address: z.string().nullable().optional(),
  biteship_api_key: z.string().nullable().optional(),
  origin_postal_code: z.string().nullable().optional(),
  pixel_meta_id: z.string().nullable().optional(),
  pixel_tiktok_id: z.string().nullable().optional(),
  pixel_google_id: z.string().nullable().optional(),
  seo_default_title: z.string().nullable().optional(),
  seo_default_description: z.string().nullable().optional(),
});

export async function GET() {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { data, error } = await ctx.supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(request: Request) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  // Convert empty strings to null so the DB stores NULL for unset fields.
  const patch: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    patch[k] = v === "" || v === undefined ? null : v;
  }
  // store_name has NOT NULL, so keep it as a string.
  patch.store_name = parsed.data.store_name;
  const updated = { ...patch, updated_at: new Date().toISOString() };
  const { data, error } = await ctx.supabase
    .from("site_settings")
    .upsert({ id: 1, ...updated })
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
