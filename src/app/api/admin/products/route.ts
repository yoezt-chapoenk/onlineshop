import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";
import { ProductSchema, productToRow, tiersToRows } from "./_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { data, error } = await ctx.supabase
    .from("products")
    .select("*, product_price_tiers(*)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => null);
  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const row = productToRow(parsed.data);
  const { data, error } = await ctx.supabase
    .from("products")
    .insert(row)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

  const productId = (data as { id: string }).id;
  const tiers = tiersToRows(productId, parsed.data.price_tiers);
  if (tiers.length > 0) {
    const { error: tierErr } = await ctx.supabase
      .from("product_price_tiers")
      .insert(tiers);
    if (tierErr) {
      return NextResponse.json({ error: tierErr.message }, { status: 500 });
    }
  }
  return NextResponse.json({ product: data });
}
