import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";
import { ProductSchema, productToRow } from "./_shared";

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
  // Use the same atomic tier RPC so both create and update paths
  // share one transactional code path on the database side.
  const { error: rpcErr } = await ctx.supabase.rpc("replace_product_price_tiers", {
    p_product_id: productId,
    p_tiers: parsed.data.price_tiers.map((t) => ({
      min_qty: t.min_qty,
      max_qty: t.max_qty,
      unit_price: t.unit_price,
      label: t.label,
    })),
  });
  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 500 });
  }
  return NextResponse.json({ product: data });
}
