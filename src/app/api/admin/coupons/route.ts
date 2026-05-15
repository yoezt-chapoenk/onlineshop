import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CouponSchema = z.object({
  code: z.string().min(2).max(40),
  description: z.string().optional().nullable(),
  discount_type: z.enum(["percent", "fixed"]),
  discount_value: z.number().int().positive(),
  min_subtotal: z.number().int().nonnegative().default(0),
  max_uses: z.number().int().positive().nullable().optional(),
  valid_from: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { data, error } = await ctx.supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(request: Request) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => null);
  const parsed = CouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  // Percent coupons cap at 100
  if (
    parsed.data.discount_type === "percent" &&
    parsed.data.discount_value > 100
  ) {
    return NextResponse.json(
      { error: "Percent discount must be 1..100" },
      { status: 400 },
    );
  }
  const { data, error } = await ctx.supabase
    .from("coupons")
    .insert({
      ...parsed.data,
      code: parsed.data.code.toUpperCase(),
    })
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupon: data });
}
