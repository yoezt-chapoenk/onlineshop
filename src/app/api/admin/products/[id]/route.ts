import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";
import { revalidateCatalog } from "@/lib/admin/revalidate";
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

  const { error: varErr } = await ctx.supabase.rpc("replace_product_variants", {
    p_product_id: id,
    p_variants: (parsed.data.variants ?? []).map((v, idx) => ({
      id: v.id ?? null,
      sku: v.sku,
      color: v.color ?? null,
      variant_type: v.variant_type ?? null,
      size: v.size ?? null,
      stock: v.stock,
      price_override: v.price_override ?? null,
      image_url: v.image_url ?? null,
      sort_order: v.sort_order ?? idx,
    })),
  });
  if (varErr) {
    return NextResponse.json({ error: varErr.message }, { status: 500 });
  }
  revalidateCatalog(parsed.data.slug);
  return NextResponse.json({ product: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
  // Look up the slug first so we can target the right detail-page cache key
  // before the row disappears.
  const { data: pre } = await ctx.supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await ctx.supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateCatalog((pre as { slug?: string } | null)?.slug);
  return NextResponse.json({ ok: true });
}
