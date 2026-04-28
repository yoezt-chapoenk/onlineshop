import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";
import { ProductSchema, productToRow, tiersToRows } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
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
    .update(row)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Replace tiers atomically: delete existing then insert new ones.
  const { error: delErr } = await ctx.supabase
    .from("product_price_tiers")
    .delete()
    .eq("product_id", id);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }
  const tiers = tiersToRows(id, parsed.data.price_tiers);
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
  const { error } = await ctx.supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
