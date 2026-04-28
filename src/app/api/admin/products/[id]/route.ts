import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";
import { ProductSchema, productToRow } from "../_shared";

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

  // Atomic tier replacement via Postgres function. Doing the
  // delete + insert as two separate Supabase calls is unsafe: a
  // failed insert (e.g. constraint violation, transient error) would
  // permanently destroy the previous tiers because the delete is
  // already committed. The RPC wraps both statements in a single
  // transaction so the table is never left empty on failure.
  const { error: rpcErr } = await ctx.supabase.rpc("replace_product_price_tiers", {
    p_product_id: id,
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
